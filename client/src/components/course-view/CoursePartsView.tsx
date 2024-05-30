// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Archive, Delete, Unarchive} from '@mui/icons-material';
import {Box, Button} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useMemo, useState} from 'react';
import {useBlocker, useParams} from 'react-router-dom';

import {
  EditCoursePartData,
  NewCoursePartData,
  SystemRole,
} from '@/common/types';
import NewAplusAttainmentsDialog from './NewAplusAttainmentsDialog';
import AddCoursePartDialog from './NewCoursePartDialog';
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

type ColTypes = {
  id: number;
  coursePartId: number;
  name: string;
  daysValid: number;
  validUntil: Date | null;
  archived: boolean;
};

const CoursePartsView = (): JSX.Element => {
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
  const [error, setError] = useState<boolean>(false);
  const [addDialogOpen, setAddDialogOpen] = useState<boolean>(false);
  const [aplusDialogOpen, setAplusDialogOpen] = useState<boolean>(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState<boolean>(false);

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
      validUntil: null,
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

  const handleAddCoursePart = (name: string, daysValid: number): void => {
    setRows(oldRows => {
      const freeId =
        oldRows.reduce((mxVal, row) => Math.max(mxVal, row.id), 0) + 1;
      return oldRows.concat({
        id: freeId,
        coursePartId: -1,
        name,
        daysValid,
        validUntil: null,
        archived: false,
      });
    });
  };

  const handleSubmit = async (): Promise<void> => {
    const newCourseParts: NewCoursePartData[] = [];
    const deletedCourseParts: number[] = [];
    const editedCourseParts: ({coursePartsId: number} & EditCoursePartData)[] =
      [];

    for (const row of rows) {
      if (row.coursePartId === -1) {
        newCourseParts.push({
          name: row.name,
          daysValid: row.daysValid,
        });
      } else {
        editedCourseParts.push({
          coursePartsId: row.coursePartId,
          name: row.name,
          daysValid: row.daysValid,
          archived: row.archived,
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
      ...editedCourseParts.map(coursePart =>
        editCoursePart.mutateAsync({
          coursePartId: coursePart.coursePartsId,
          coursePart: coursePart,
        })
      ),
    ]);

    enqueueSnackbar('Course parts saved successfully', {variant: 'success'});
    setInitRows(structuredClone(rows));
  };

  const getActions = (params: GridRowParams<ColTypes>): JSX.Element[] => {
    const elements = [];
    if (params.row.coursePartId !== -1) {
      elements.push(
        <GridActionsCellItem
          icon={params.row.archived ? <Unarchive /> : <Archive />}
          label={params.row.archived ? 'Unarchive' : 'Archive'}
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
          label="Delete"
          onClick={() => {
            if (coursePartsWithModels.has(params.row.coursePartId)) {
              // TODO: Show confirm
            }
            setRows(oldRows => oldRows.filter(row => row.id !== params.id));
          }}
        />
      );
    }

    return elements;
  };

  const columns: GridColDef<ColTypes>[] = [
    {
      field: 'name',
      headerName: 'Name',
      type: 'string',
      editable: true,
    },
    {
      field: 'daysValid',
      headerName: 'Days valid',
      type: 'number',
      editable: true,
    },
    {
      field: 'validUntil',
      headerName: 'Valid until',
      type: 'date',
      editable: true,
    },
    {
      field: 'archived',
      headerName: 'Archived',
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

  return (
    <>
      <AddCoursePartDialog
        handleClose={() => setAddDialogOpen(false)}
        open={addDialogOpen}
        onSave={handleAddCoursePart}
      />
      <NewAplusAttainmentsDialog
        handleClose={() => setAplusDialogOpen(false)}
        open={aplusDialogOpen}
      />
      <UnsavedChangesDialog
        open={unsavedDialogOpen || blocker.state === 'blocked'}
        onClose={() => {
          setUnsavedDialogOpen(false);
          if (blocker.state === 'blocked') blocker.reset();
        }}
        handleDiscard={() => {
          setRows(structuredClone(initRows));
          if (blocker.state === 'blocked') blocker.proceed();
        }}
      />
      <>Course parts</>
      <Box sx={{display: 'flex', mb: 1}}>
        {editRights && (
          <Button onClick={() => setAddDialogOpen(true)}>
            Add course part
          </Button>
        )}

        {editRights && (
          <Button onClick={() => setAplusDialogOpen(true)}>Add from A+</Button>
        )}

        {editRights && (
          <div style={{marginLeft: '10px'}}>
            {unsavedChanges && (
              <Button onClick={() => setUnsavedDialogOpen(true)}>
                Discard
              </Button>
            )}
            <Button
              onClick={handleSubmit}
              variant={unsavedChanges ? 'contained' : 'text'}
              disabled={error || editing}
            >
              Save
            </Button>
          </div>
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
            // TODO: do some validation. Code below is an example.
            // for (const [key, val] of Object.entries(updatedRow)) {
            //   if (key === 'id' || key === 'StudentNo') continue;
            //   if ((val as number) < 0)
            //     throw new Error('Value cannot be negative');
            //   else if ((val as number) > 5000)
            //     throw new Error('Value cannot be over 5000');
            // }
            // setSnackBar({message: 'Row saved!', severity: 'success'});
            setError(false);
            return updatedRow;
          }}
          onProcessRowUpdateError={(rowError: Error) => {
            setError(true);
            enqueueSnackbar(rowError.message, {variant: 'error'});
          }}
        />
      </div>
    </>
  );
};

export default CoursePartsView;
