// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AddCircle, Archive, Delete, More, Unarchive} from '@mui/icons-material';
import {Box, Button, Typography} from '@mui/material';
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
  EditCoursePartData,
  NewCoursePartData,
  SystemRole,
} from '@/common/types';
import AddAplusGradeSourceDialog from './AddAplusGradeSourceDialog';
import NewAplusCoursePartsDialog from './NewAplusCoursePartsDialog';
import AddCoursePartDialog from './NewCoursePartDialog';
import ViewAplusGradeSourcesDialog from './ViewAplusGradeSourcesDialog';
import {
  useAddCoursePart,
  useDeleteCoursePart,
  useEditCoursePart,
  useGetAllGradingModels,
  useGetCourseParts,
  useGetGrades,
} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';
import SaveBar from '../shared/SaveBar';

type ColTypes = {
  id: number;
  coursePartId: number;
  name: string;
  daysValid: number;
  maxGrade: number | null;
  validUntil: Date | null;
  aplusGradeSources: AplusGradeSourceData[];
  archived: boolean;
};

const CoursePartsView = (): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const {auth, isTeacherInCharge} = useAuth();

  const grades = useGetGrades(courseId);
  const gradingModels = useGetAllGradingModels(courseId);
  const courseParts = useGetCourseParts(courseId);
  const addCoursePart = useAddCoursePart(courseId);
  const editCoursePart = useEditCoursePart(courseId);
  const deleteCoursePart = useDeleteCoursePart(courseId);

  const [initRows, setInitRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rows, setRows] = useState<GridRowsProp<ColTypes>>([]);
  const [editing, setEditing] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [aplusDialogOpen, setAplusDialogOpen] = useState<boolean>(false);
  const [addAplusSourcesTo, setAddAplusSourcesTo] = useState<{
    coursePartId: number | null;
    aplusGradeSources: AplusGradeSourceData[];
  }>({
    coursePartId: null,
    aplusGradeSources: [],
  });
  const [viewAplusSourcesOpen, setViewAplusSourcesOpen] =
    useState<boolean>(false);
  const [aplusGradeSources, setAplusGradeSources] = useState<
    AplusGradeSourceData[]
  >([]);

  const coursePartsWithGrades = useMemo(() => {
    const withGrades = new Set<number>();
    if (grades.data === undefined) return withGrades;
    for (const grade of grades.data) {
      for (const coursePart of grade.courseParts) {
        if (coursePart.grades.length > 0) {
          withGrades.add(coursePart.coursePartId);
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

  useEffect(() => {
    if (courseParts.data === undefined) return;
    const newRows = courseParts.data.map(coursePart => ({
      id: coursePart.id,
      coursePartId: coursePart.id,
      name: coursePart.name,
      daysValid: coursePart.daysValid,
      maxGrade: coursePart.maxGrade,
      validUntil: null,
      aplusGradeSources: coursePart.aplusGradeSources,
      archived: coursePart.archived,
    }));
    if (JSON.stringify(newRows) === JSON.stringify(rows)) return;
    setRows(newRows);
    setInitRows(structuredClone(newRows));
  }, [courseParts.data]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleAddCoursePart = (
    name: string,
    daysValid: number,
    maxGrade: number | null
  ): void => {
    setRows(oldRows => {
      const freeId =
        oldRows.reduce((mxVal, row) => Math.max(mxVal, row.id), 0) + 1;
      return oldRows.concat({
        id: freeId,
        coursePartId: -1,
        name,
        daysValid,
        maxGrade,
        validUntil: null,
        aplusGradeSources: [],
        archived: false,
      });
    });
  };

  const handleSubmit = async (): Promise<void> => {
    const newCourseParts: NewCoursePartData[] = [];
    const deletedCourseParts: number[] = [];
    const editedCourseParts: {
      coursePartsId: number;
      coursePart: EditCoursePartData;
    }[] = [];

    for (const row of rows) {
      if (row.coursePartId === -1) {
        newCourseParts.push({
          name: row.name,
          daysValid: row.daysValid,
          maxGrade: row.maxGrade,
        });
      } else {
        editedCourseParts.push({
          coursePartsId: row.coursePartId,
          coursePart: {
            name: row.name,
            daysValid: row.daysValid,
            maxGrade: row.maxGrade,
            archived: row.archived,
          },
        });
      }
    }

    const newAttIds = rows.map(row => row.coursePartId);
    for (const initRow of initRows) {
      if (!newAttIds.includes(initRow.coursePartId))
        deletedCourseParts.push(initRow.coursePartId);
    }

    await Promise.all([
      ...newCourseParts.map(coursePart =>
        addCoursePart.mutateAsync(coursePart)
      ),
      ...deletedCourseParts.map(coursePartId =>
        deleteCoursePart.mutateAsync(coursePartId)
      ),
      ...editedCourseParts.map(coursePartData =>
        editCoursePart.mutateAsync({
          coursePartId: coursePartData.coursePartsId,
          coursePart: coursePartData.coursePart,
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
            coursePartId: params.row.id,
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
    if (!coursePartsWithGrades.has(params.row.coursePartId)) {
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
      headerName: t('general.a+-sources'),
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
    if (await AsyncConfirmationModal({confirmNavigate: true})) {
      setRows(structuredClone(initRows));
    }
  };

  return (
    <>
      <AddCoursePartDialog
        onClose={() => setAddDialogOpen(false)}
        open={addDialogOpen}
        onSave={handleAddCoursePart}
      />
      <NewAplusCoursePartsDialog
        handleClose={() => setAplusDialogOpen(false)}
        open={aplusDialogOpen}
      />
      <AddAplusGradeSourceDialog
        handleClose={() =>
          setAddAplusSourcesTo({
            coursePartId: null,
            aplusGradeSources: [],
          })
        }
        coursePartId={addAplusSourcesTo.coursePartId}
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
          {t('general.course-part.plural')}
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
            <Button variant="outlined" onClick={() => setAddDialogOpen(true)}>
              {t('course.parts.add-new')}
            </Button>
            <Button variant="outlined" onClick={() => setAplusDialogOpen(true)}>
              {t('course.parts.add-from-a+')}
            </Button>
          </>
        )}
      </Box>

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
              oldRows.map(row => (row.id === updatedRow.id ? updatedRow : row))
            );
            return updatedRow;
          }}
        />
      </div>
    </>
  );
};

export default CoursePartsView;
