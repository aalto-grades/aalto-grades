// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Add,
  AddCircle,
  Archive,
  Delete,
  Edit,
  FontDownload,
  Unarchive,
} from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Grid2 as Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material';
import {grey} from '@mui/material/colors';
import {
  GridActionsCellItem,
  type GridColDef,
  type GridRowParams,
  type GridRowsProp,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker, useParams} from 'react-router-dom';

import {
  type AplusGradeSourceData,
  type CoursePartData,
  type ModifyCourseTasks,
  SystemRole,
} from '@/common/types';
import DataGridBase from '@/components/shared/DataGridBase';
import SaveBar from '@/components/shared/SaveBar';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {
  useDeleteCoursePart,
  useEditCoursePart,
  useGetAllGradingModels,
  useGetCourseParts,
  useGetCourseTasks,
  useGetGrades,
  useModifyCourseTasks,
} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import AddAplusGradeSourceDialog from './course-parts-view/AddAplusGradeSourceDialog';
import EditCoursePartDialog from './course-parts-view/EditCoursePartDialog';
import NewAplusCourseTasksDialog from './course-parts-view/NewAplusCourseTasksDialog';
import NewCoursePartDialog from './course-parts-view/NewCoursePartDialog';
import ViewAplusGradeSourcesDialog from './course-parts-view/ViewAplusGradeSourcesDialog';

type ColTypes = {
  id: number;
  coursePartId: number;
  name: string;
  daysValid: number | null;
  maxGrade: number | null;
  archived: boolean;
  aplusGradeSources: AplusGradeSourceData[];
  new: boolean;
};

const CoursePartsView = (): JSX.Element => {
  const {t} = useTranslation();
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId} = useParams() as {courseId: string};

  const gradingModels = useGetAllGradingModels(courseId);
  const courseParts = useGetCourseParts(courseId);
  const editCoursePart = useEditCoursePart(courseId);
  const delCoursePart = useDeleteCoursePart(courseId);

  const courseTasks = useGetCourseTasks(courseId);
  const modifyCourseTasks = useModifyCourseTasks(courseId);
  const grades = useGetGrades(courseId);

  const [addPartDialogOpen, setAddPartDialogOpen] = useState<boolean>(false);
  const [editPartDialogOpen, setEditPartDialogOpen] = useState<boolean>(false);
  const [editPart, setEditPart] = useState<CoursePartData | null>(null);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);

  const [initRows, setInitRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rows, setRows] = useState<GridRowsProp<ColTypes>>([]);
  const [editing, setEditing] = useState<boolean>(false);

  const [aplusDialogOpen, setAplusDialogOpen] = useState<boolean>(false);
  const [addAplusSourcesTo, setAddAplusSourcesTo] = useState<{
    courseTaskId: number | null;
    aplusGradeSources: AplusGradeSourceData[];
  }>({
    courseTaskId: null,
    aplusGradeSources: [],
  });
  const [viewAplusSourcesOpen, setViewAplusSourcesOpen] =
    useState<boolean>(false);
  const [aplusGradeSources, setAplusGradeSources] = useState<
    AplusGradeSourceData[]
  >([]);

  const courseTasksWithGrades = useMemo(() => {
    const withGrades = new Set<number>();
    if (grades.data === undefined) return withGrades;
    for (const grade of grades.data) {
      for (const courseTask of grade.courseTasks) {
        if (courseTask.grades.length > 0) {
          withGrades.add(courseTask.courseTaskId);
        }
      }
    }
    return withGrades;
  }, [grades.data]);

  const courseTasksWithModels = useMemo(() => {
    const withModels = new Set<number>();
    if (gradingModels.data === undefined) return withModels;
    for (const model of gradingModels.data) {
      for (const node of model.graphStructure.nodes) {
        if (node.type !== 'source') continue;
        withModels.add(parseInt(node.id.split('-')[1]));
      }
    }
    return withModels;
  }, [gradingModels.data]);

  const courseTasksByCoursePartId = (coursePartId: number): Array<number> => {
    if (courseTasks.data) {
      return courseTasks.data
        .filter(courseTask => courseTask.coursePartId === coursePartId)
        .map(courseTask => courseTask.id);
    }
    return [];
  };

  const deleteCoursePartConfirmMessage = (
    coursePartId: number
  ): string | undefined => {
    const courseTasksOfPart = courseTasksByCoursePartId(coursePartId);
    const includeTaskWithModels = courseTasksOfPart.some(taskId =>
      courseTasksWithModels.has(taskId)
    );
    if (includeTaskWithModels)
      return t('course.parts.delete-with-model-message');
    if (courseTasksOfPart.length > 0)
      return t('course.parts.delete-with-task-message');
    return t('course.parts.delete-message');
  };

  const handleDeleteCoursePart = async (
    coursePartId: number
  ): Promise<void> => {
    const confirmation = await AsyncConfirmationModal({
      title: t('course.parts.delete'),
      message: deleteCoursePartConfirmMessage(coursePartId),
      confirmDelete: true,
    });
    if (confirmation) {
      delCoursePart.mutate(coursePartId);
      if (selectedPart === coursePartId) {
        const currentRows = [...rows];
        const newRows = currentRows.filter(
          row => row.coursePartId !== coursePartId
        );
        setRows(newRows);
        setInitRows(structuredClone(newRows));
        setSelectedPart(null);
      }
    }
  };

  const isCoursePartDeletable = (coursePartId: number): boolean => {
    return courseTasksByCoursePartId(coursePartId).some(taskId =>
      courseTasksWithGrades.has(taskId)
    );
  };

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

  const unsavedChanges = useMemo(
    () => JSON.stringify(initRows) !== JSON.stringify(rows),
    [initRows, rows]
  );

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      unsavedChanges && currentLocation.pathname !== nextLocation.pathname
  );

  // Warning if leaving with unsaved
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (unsavedChanges) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsavedChanges]);

  const updateRows = (partId: number): void => {
    if (courseTasks.data === undefined) return;
    const newRows = courseTasks.data
      .filter(courseTask => courseTask.coursePartId === partId)
      .map(courseTask => ({
        id: courseTask.id,
        coursePartId: courseTask.coursePartId,
        name: courseTask.name,
        daysValid: courseTask.daysValid,
        maxGrade: courseTask.maxGrade,
        archived: courseTask.archived,
        aplusGradeSources: courseTask.aplusGradeSources,
        new: false,
      }));
    setRows(newRows);
    setInitRows(structuredClone(newRows));
  };

  // Update rows when course tasks change
  const [oldCourseTaskData, setOldCourseTaskData] =
    useState<typeof courseTasks.data>(undefined);
  if (courseTasks.data !== oldCourseTaskData) {
    setOldCourseTaskData(courseTasks.data);
    if (selectedPart !== null) updateRows(selectedPart);
  }

  const handleSelectCoursePart = async (partId: number): Promise<void> => {
    if (partId === selectedPart) return;

    if (unsavedChanges) {
      const confirmation = await AsyncConfirmationModal({confirmDiscard: true});
      if (!confirmation) return;
    }
    setSelectedPart(partId);
    updateRows(partId);
  };

  const handleSubmit = async (): Promise<void> => {
    const modifications: ModifyCourseTasks = {add: [], edit: [], delete: []};

    for (const row of rows) {
      if (row.new) {
        modifications.add!.push({
          name: row.name,
          coursePartId: selectedPart!,
          daysValid: row.daysValid,
          maxGrade: row.maxGrade,
        });
      } else {
        modifications.edit!.push({
          id: row.id,
          name: row.name,
          daysValid: row.daysValid,
          maxGrade: row.maxGrade,
        });
      }
    }
    const newAttIds = new Set(rows.map(row => row.id));
    for (const initRow of initRows) {
      if (!newAttIds.has(initRow.id)) modifications.delete!.push(initRow.id);
    }
    await modifyCourseTasks.mutateAsync(modifications);
    enqueueSnackbar(t('course.parts.saved'), {variant: 'success'});
    setInitRows(structuredClone(rows));
  };

  const getAplusActions = (params: GridRowParams<ColTypes>): JSX.Element[] => {
    const elements = [];

    if (editRights) {
      elements.push(
        <Tooltip title={unsavedChanges ? t('course.parts.a+-disabled') : ''}>
          <span>
            <GridActionsCellItem
              label={t('course.parts.add-a+-source')}
              icon={<AddCircle />}
              disabled={unsavedChanges}
              onClick={() =>
                setAddAplusSourcesTo({
                  courseTaskId: params.row.id,
                  aplusGradeSources: params.row.aplusGradeSources,
                })
              }
            />
          </span>
        </Tooltip>
      );
    }

    if (params.row.aplusGradeSources.length > 0) {
      elements.push(
        <GridActionsCellItem
          // Big A icon :p
          icon={<FontDownload />}
          label={t('course.parts.view-a+-sources')}
          onClick={() => {
            setAplusGradeSources(params.row.aplusGradeSources);
            setViewAplusSourcesOpen(true);
          }}
        />
      );
    }

    return elements;
  };

  const getActions = (params: GridRowParams<ColTypes>): JSX.Element[] => {
    const elements = [];

    if (params.row.coursePartId !== -1) {
      elements.push(
        <GridActionsCellItem
          icon={params.row.archived ? <Unarchive /> : <Archive />}
          label={
            params.row.archived
              ? t('course.parts.unarchive')
              : t('course.parts.archive')
          }
          onClick={() =>
            setRows(oldRows =>
              oldRows.map(row =>
                row.id !== params.id
                  ? row
                  : {...row, archived: !params.row.archived}
              )
            )
          }
        />
      );
    }
    if (!courseTasksWithGrades.has(params.row.id)) {
      elements.push(
        <GridActionsCellItem
          icon={<Delete />}
          label={t('general.delete')}
          onClick={async () => {
            let confirmation = true;
            if (courseTasksWithModels.has(params.row.id)) {
              confirmation = await AsyncConfirmationModal({
                title: t('course.parts.delete-task'),
                message: t('course.parts.delete-task-message'),
                confirmDelete: true,
              });
            }
            if (confirmation) {
              setRows(oldRows => oldRows.filter(row => row.id !== params.id));
            }
          }}
        />
      );
    }

    return elements;
  };

  const columns: GridColDef<ColTypes>[] = [
    {
      field: 'name',
      headerName: t('general.name'),
      type: 'string',
      editable: editRights,
    },
    {
      field: 'daysValid',
      headerName: t('general.days-valid'),
      type: 'number',
      editable: editRights,
    },
    {
      field: 'maxGrade',
      headerName: t('general.max-grade'),
      type: 'number',
      editable: editRights,
    },
    {
      field: 'aplusGradeSources',
      headerName: t('general.a+-grade-sources'),
      type: 'actions',
      getActions: getAplusActions,
    },
    {
      field: 'archived',
      headerName: t('course.parts.archived'),
      type: 'boolean',
      editable: false,
    },
    ...(editRights
      ? [
          {
            field: 'actions',
            type: 'actions',
            getActions: getActions,
          } as GridColDef,
        ]
      : []),
  ];

  const DataGridToolbar = (): JSX.Element => {
    const handleClick = (): void => {
      setRows(oldRows => {
        const freeId = Math.max(0, ...oldRows.map(row => row.id)) + 1;
        const newRow: ColTypes = {
          id: freeId,
          coursePartId: selectedPart!,
          daysValid: null,
          maxGrade: null,
          name: '',
          archived: false,
          aplusGradeSources: [],
          new: true,
        };
        return oldRows.concat(newRow);
      });
    };
    return (
      <GridToolbarContainer>
        <Button
          startIcon={<Add />}
          onClick={handleClick}
          disabled={selectedPart === null || !editRights}
        >
          {t('course.parts.add-new-task')}
        </Button>
        <Tooltip title={unsavedChanges ? t('course.parts.a+-disabled') : ''}>
          <span>
            <Button
              startIcon={<Add />}
              onClick={() => setAplusDialogOpen(true)}
              disabled={selectedPart === null || unsavedChanges || !editRights}
            >
              {t('course.parts.add-from-a+')}
            </Button>
          </span>
        </Tooltip>
      </GridToolbarContainer>
    );
  };

  const sortCourseParts = (a: CoursePartData, b: CoursePartData): number => {
    if (a.archived && !b.archived) return 1;
    if (b.archived && !a.archived) return -1;
    return a.id - b.id;
  };

  const confirmDiscard = async (): Promise<void> => {
    if (await AsyncConfirmationModal({confirmDiscard: true})) {
      setRows(structuredClone(initRows));
    }
  };

  return (
    <>
      <NewCoursePartDialog
        open={addPartDialogOpen}
        onClose={() => setAddPartDialogOpen(false)}
      />
      <EditCoursePartDialog
        open={editPartDialogOpen}
        onClose={() => setEditPartDialogOpen(false)}
        coursePart={editPart}
      />
      <NewAplusCourseTasksDialog
        open={aplusDialogOpen}
        onClose={() => setAplusDialogOpen(false)}
        coursePartId={selectedPart}
      />
      <AddAplusGradeSourceDialog
        onClose={() =>
          setAddAplusSourcesTo({courseTaskId: null, aplusGradeSources: []})
        }
        courseTaskId={addAplusSourcesTo.courseTaskId}
        aplusGradeSources={addAplusSourcesTo.aplusGradeSources}
      />
      <ViewAplusGradeSourcesDialog
        open={viewAplusSourcesOpen}
        onClose={() => setViewAplusSourcesOpen(false)}
        aplusGradeSources={aplusGradeSources}
      />
      <UnsavedChangesDialog
        blocker={blocker}
        handleDiscard={() => setRows(structuredClone(initRows))}
      />

      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <Typography width="fit-content" variant="h2">
          {t('general.course-parts')}
        </Typography>
        <SaveBar
          show={editRights && unsavedChanges}
          handleDiscard={confirmDiscard}
          handleSave={handleSubmit}
          disabled={editing}
        />
      </div>

      <Box sx={{display: 'flex', gap: 1, mb: 1, mt: 1}}>
        {editRights && (
          <Button variant="outlined" onClick={() => setAddPartDialogOpen(true)}>
            {t('course.parts.add-new-part')}
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid size={4}>
          {courseParts.data === undefined ? (
            <CircularProgress />
          ) : (
            courseParts.data.length === 0 && (
              <Typography>{t('course.parts.no-course-parts')}</Typography>
            )
          )}
          <List>
            {courseParts.data?.sort(sortCourseParts).map(coursePart => (
              <ListItem
                key={coursePart.id}
                sx={{
                  backgroundColor: coursePart.archived ? grey[200] : '',
                  border: selectedPart === coursePart.id ? '1px solid' : 'none',
                  borderRadius: '5px',
                }}
                disablePadding
                secondaryAction={
                  editRights ? (
                    <>
                      <Tooltip
                        placement="top"
                        title={t('course.parts.edit-part')}
                      >
                        <IconButton
                          onClick={() => {
                            setEditPart(coursePart);
                            setEditPartDialogOpen(true);
                          }}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        placement="top"
                        title={
                          coursePart.archived
                            ? t('course.parts.unarchive')
                            : t('course.parts.archive')
                        }
                      >
                        <IconButton
                          onClick={() => {
                            editCoursePart.mutate({
                              coursePartId: coursePart.id,
                              coursePart: {archived: !coursePart.archived},
                            });
                          }}
                        >
                          {coursePart.archived ? <Unarchive /> : <Archive />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        placement="top"
                        title={
                          isCoursePartDeletable(coursePart.id)
                            ? t('course.parts.cannot-delete-with-grades')
                            : t('course.parts.delete')
                        }
                      >
                        <span>
                          <IconButton
                            disabled={isCoursePartDeletable(coursePart.id)}
                            edge="end"
                            onClick={async () =>
                              handleDeleteCoursePart(coursePart.id)
                            }
                          >
                            <Delete />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </>
                  ) : null
                }
              >
                <ListItemButton
                  onClick={() => {
                    handleSelectCoursePart(coursePart.id);
                  }}
                >
                  <ListItemText
                    primary={coursePart.name}
                    secondary={
                      coursePart.expiryDate?.toLocaleDateString() ??
                      t('course.parts.no-expiry-date')
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid size={8}>
          <div style={{height: '100%', maxHeight: '70vh'}}>
            <DataGridBase
              rows={rows}
              columns={columns}
              rowHeight={25}
              editMode="row"
              rowSelection={false}
              disableColumnSelector
              slots={editRights ? {toolbar: DataGridToolbar} : {}}
              onRowEditStart={() => setEditing(true)}
              onRowEditStop={() => setEditing(false)}
              processRowUpdate={(updatedRow: ColTypes) => {
                setRows(oldRows =>
                  oldRows.map(row =>
                    row.id === updatedRow.id ? updatedRow : row
                  )
                );
                return updatedRow;
              }}
            />
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default CoursePartsView;
