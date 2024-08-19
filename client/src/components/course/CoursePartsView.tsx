// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AddCircle,
  Archive,
  Delete,
  Edit,
  More,
  OpenInNew,
  Unarchive,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
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
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker, useParams} from 'react-router-dom';

import {
  AplusGradeSourceData,
  EditCourseTaskData,
  NewCourseTaskData,
  SystemRole,
} from '@/common/types';
import SaveBar from '@/components/shared/SaveBar';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {
  useAddCourseTask,
  useDeleteCourseTask,
  useEditCourseTask,
  useGetCourseTasks,
} from '@/hooks/api/courseTask';
import {
  useGetAllGradingModels,
  useGetCourseParts,
  useGetGrades,
} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import AddAplusGradeSourceDialog from './course-parts-view/AddAplusGradeSourceDialog';
import NewAplusCoursePartsDialog from './course-parts-view/NewAplusCoursePartsDialog';
import AddCoursePartDialog from './course-parts-view/NewCoursePartDialog';
import AddCourseTaskDialog from './course-parts-view/NewCourseTaskDialog';
import ViewAplusGradeSourcesDialog from './course-parts-view/ViewAplusGradeSourcesDialog';

type ColTypes = {
  id: number;
  coursePartId: number;
  name: string;
  daysValid: number | null;
  maxGrade: number | null;
  archived: boolean;
  aplusGradeSources: AplusGradeSourceData[];
};

const CoursePartsView = (): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge} = useAuth();

  const gradingModels = useGetAllGradingModels(courseId);
  const courseParts = useGetCourseParts(courseId);

  const grades = useGetGrades(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const addCourseTask = useAddCourseTask(courseId);
  const editCourseTask = useEditCourseTask(courseId);
  const deleteCourseTask = useDeleteCourseTask(courseId);

  const [addPartDialogOpen, setAddPartDialogOpen] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<number | null>(null);

  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState<boolean>(false);
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

  const coursePartsWithModels = useMemo(() => {
    const withModels = new Set<number>();
    if (gradingModels.data === undefined) return withModels;
    for (const model of gradingModels.data) {
      for (const node of model.graphStructure.nodes) {
        if (node.type !== 'coursepart') continue;
        withModels.add(parseInt(node.id.split('-')[1]));
      }
    }
    return withModels;
  }, [gradingModels.data]);

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
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [unsavedChanges]);

  const handleSelectCoursePart = async (partId: number): Promise<void> => {
    if (partId === selectedPart) return;

    if (unsavedChanges) {
      const confirmation = await AsyncConfirmationModal({confirmDiscard: true});
      if (!confirmation) return;
    }
    setSelectedPart(partId);

    if (courseTasks.data === undefined) return;
    const newRows = courseTasks.data
      .filter(courseTask => courseTask.coursePartId === partId)
      .map(courseTask => ({
        id: courseTask.id,
        coursePartId: courseTask.id,
        name: courseTask.name,
        daysValid: courseTask.daysValid,
        maxGrade: courseTask.maxGrade,
        archived: courseTask.archived,
        aplusGradeSources: courseTask.aplusGradeSources,
      }));
    setRows(newRows);
    setInitRows(structuredClone(newRows));
  };

  const handleAddCourseTask = (
    name: string,
    daysValid: number | null,
    maxGrade: number | null
  ): void => {
    setRows(oldRows => {
      const freeId = Math.max(...oldRows.map(row => row.id)) + 1;
      return oldRows.concat({
        id: freeId,
        coursePartId: -1,
        name,
        daysValid,
        maxGrade,
        archived: false,
        aplusGradeSources: [],
      });
    });
  };

  const handleSubmit = async (): Promise<void> => {
    const newCourseTasks: NewCourseTaskData[] = [];
    const deletedCourseTasks: number[] = [];
    const editedCourseTasks: {
      courseTaskId: number;
      courseTask: EditCourseTaskData;
    }[] = [];

    for (const row of rows) {
      if (row.coursePartId === -1) {
        newCourseTasks.push({
          name: row.name,
          coursePartId: selectedPart!,
          daysValid: row.daysValid,
          maxGrade: row.maxGrade,
        });
      } else {
        editedCourseTasks.push({
          courseTaskId: row.coursePartId,
          courseTask: {
            name: row.name,
            daysValid: row.daysValid,
            maxGrade: row.maxGrade,
          },
        });
      }
    }

    const newAttIds = new Set(rows.map(row => row.coursePartId));
    for (const initRow of initRows) {
      if (!newAttIds.has(initRow.coursePartId))
        deletedCourseTasks.push(initRow.coursePartId);
    }

    await Promise.all([
      ...newCourseTasks.map(courseTask =>
        addCourseTask.mutateAsync(courseTask)
      ),
      ...deletedCourseTasks.map(coursePartId =>
        deleteCourseTask.mutateAsync(coursePartId)
      ),
      ...editedCourseTasks.map(courseTaskData =>
        editCourseTask.mutateAsync({
          courseTaskId: courseTaskData.courseTaskId,
          courseTask: courseTaskData.courseTask,
        })
      ),
    ]);

    enqueueSnackbar(t('course.parts.saved'), {variant: 'success'});
    setInitRows(structuredClone(rows));
  };

  const getAplusActions = (params: GridRowParams<ColTypes>): JSX.Element[] => {
    const elements: JSX.Element[] = [];

    elements.push(
      <GridActionsCellItem
        icon={<AddCircle />}
        label={t('course.parts.add-a+-source')}
        onClick={() =>
          setAddAplusSourcesTo({
            courseTaskId: params.row.id,
            aplusGradeSources: params.row.aplusGradeSources,
          })
        }
      />
    );

    if (params.row.aplusGradeSources.length > 0) {
      elements.push(
        <GridActionsCellItem
          icon={<More />}
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
    if (!courseTasksWithGrades.has(params.row.coursePartId)) {
      elements.push(
        <GridActionsCellItem
          icon={<Delete />}
          label={t('general.delete')}
          onClick={async () => {
            let confirmation = true;
            if (coursePartsWithModels.has(params.row.coursePartId)) {
              confirmation = await AsyncConfirmationModal({
                title: t('course.parts.delete'),
                message: t('course.parts.delete-message'),
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
      editable: true,
    },
    {
      field: 'daysValid',
      headerName: t('general.days-valid'),
      type: 'number',
      editable: true,
    },
    {
      field: 'maxGrade',
      headerName: t('general.max-grade'),
      type: 'number',
      editable: true,
    },
    {
      field: 'validUntil',
      headerName: t('course.parts.valid-until'),
      type: 'date',
      editable: true,
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

  const confirmDiscard = async (): Promise<void> => {
    if (await AsyncConfirmationModal({confirmDiscard: true})) {
      setRows(structuredClone(initRows));
    }
  };

  return (
    <>
      <AddCoursePartDialog
        open={addPartDialogOpen}
        onClose={() => setAddPartDialogOpen(false)}
      />
      <AddCourseTaskDialog
        open={addTaskDialogOpen}
        onClose={() => setAddTaskDialogOpen(false)}
        onSave={handleAddCourseTask}
      />
      <NewAplusCoursePartsDialog
        open={aplusDialogOpen}
        onClose={() => setAplusDialogOpen(false)}
        coursePartId={selectedPart}
      />
      <AddAplusGradeSourceDialog
        handleClose={() =>
          setAddAplusSourcesTo({
            courseTaskId: null,
            aplusGradeSources: [],
          })
        }
        courseTaskId={addAplusSourcesTo.courseTaskId}
        aplusGradeSources={addAplusSourcesTo.aplusGradeSources}
      />
      <ViewAplusGradeSourcesDialog
        handleClose={() => setViewAplusSourcesOpen(false)}
        open={viewAplusSourcesOpen}
        aplusGradeSources={aplusGradeSources}
      />
      <UnsavedChangesDialog
        blocker={blocker}
        handleDiscard={() => setRows(structuredClone(initRows))}
      />

      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
        <Typography width={'fit-content'} variant="h2">
          {t('general.course-parts')}
        </Typography>
        <SaveBar
          show={editRights && unsavedChanges}
          handleDiscard={confirmDiscard}
          handleSave={handleSubmit}
          disabled={editing}
          // loading={form.isSubmitting}
        />
      </div>

      <Box sx={{display: 'flex', gap: 1, mb: 1, mt: 1}}>
        {editRights && (
          <>
            <Button
              variant="outlined"
              onClick={() => setAddPartDialogOpen(true)}
            >
              {t('course.parts.add-new-part')}
            </Button>
            {selectedPart !== null && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setAddTaskDialogOpen(true)}
                >
                  {t('course.parts.add-new-task')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setAplusDialogOpen(true)}
                >
                  {t('course.parts.add-from-a+')}
                </Button>
              </>
            )}
          </>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={4} sx={{border: '1px solid'}}>
          <List>
            {courseParts.data?.map(coursePart => (
              <ListItem
                key={coursePart.id}
                sx={{backgroundColor: coursePart.archived ? grey[200] : ''}}
                disablePadding
                secondaryAction={
                  editRights ? (
                    <>
                      <Tooltip placement="top" title={t('Exit')}>
                        <IconButton onClick={() => {}}>
                          <OpenInNew />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        placement="top"
                        title={t('course.models.rename.title')}
                      >
                        <IconButton onClick={() => {}}>
                          <Edit />
                        </IconButton>
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
                    sx={{
                      border:
                        selectedPart === coursePart.id ? '1px solid' : 'none',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={8} sx={{border: '1px solid'}}>
          <div style={{height: '100%', maxHeight: '70vh'}}>
            <DataGrid
              rows={rows}
              columns={columns}
              rowHeight={25}
              editMode="row"
              rowSelection={false}
              disableColumnSelector
              onRowEditStart={() => setEditing(true)}
              onRowEditStop={() => setEditing(false)}
              processRowUpdate={updatedRow => {
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
