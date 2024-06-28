// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useMemo, useState} from 'react';
import {useBlocker} from 'react-router-dom';

import UnsavedChangesDialog from './alerts/UnsavedChangesDialog';
import {
  useDeleteUsers,
  useGetLatestGrades,
  useGetStudents,
} from '../hooks/useApi';

type ColTypes = {
  id: number;
  name: string | null;
  studentNumber: string | null;
  email: string | null;
  latestGrade: Date | null;
};

const columns: GridColDef<ColTypes>[] = [
  {
    field: 'name',
    headerName: 'Name',
    type: 'string',
    editable: false,
    width: 200,
  },
  {
    field: 'studentNumber',
    headerName: 'Student number',
    type: 'string',
    editable: false,
    width: 120,
  },
  {
    field: 'email',
    headerName: 'Email',
    type: 'string',
    editable: false,
    width: 150,
  },
  {
    field: 'latestGrade',
    headerName: 'Latest grade',
    type: 'date',
    editable: false,
    width: 150,
  },
];

const ManageStudentsView = (): JSX.Element => {
  const students = useGetStudents();
  const deleteUsers = useDeleteUsers();
  const getLatestGrades = useGetLatestGrades();

  const [initRows, setInitRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rows, setRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

  const changes = useMemo(
    () =>
      rowSelectionModel.length > 0 ||
      JSON.stringify(rows) !== JSON.stringify(initRows),
    [initRows, rowSelectionModel.length, rows]
  );

  const blocker = useBlocker(
    ({currentLocation, nextLocation}) =>
      changes && currentLocation.pathname !== nextLocation.pathname
  );

  // Warning if leaving with unsaved
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (changes) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [changes]);

  useEffect(() => {
    if (students.data === undefined) return;

    const setData = async (): Promise<void> => {
      const latestGrades = await getLatestGrades.mutateAsync(
        students.data.map(student => student.id)
      );
      const userLatestGrade = new Map<number, Date | null>(
        latestGrades.map(grade => [grade.userId, grade.date])
      );

      const newRows = students.data.map(student => ({
        id: student.id,
        name: student.name,
        studentNumber: student.studentNumber,
        email: student.email,
        latestGrade: userLatestGrade.get(student.id) as Date | null,
      }));
      setRows(newRows);
      setInitRows(structuredClone(newRows));
    };

    setData();
  }, [students.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (): Promise<void> => {
    await deleteUsers.mutateAsync(rowSelectionModel.map(row => Number(row)));
    enqueueSnackbar('Students deleted', {variant: 'success'});
    setConfirmOpen(false);
    setRowSelectionModel([]);
  };

  return (
    <>
      <UnsavedChangesDialog
        open={blocker.state === 'blocked'}
        onClose={() => {
          if (blocker.state === 'blocked') blocker.reset();
        }}
        handleDiscard={() => {
          if (blocker.state === 'blocked') blocker.proceed();
        }}
      />

      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete student</DialogTitle>
        <DialogContent>
          <DialogContentText>
            All of the data of the student
            {rowSelectionModel.length > 1 ? 's' : ''} will be deleted
            permanently!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h2" sx={{pb: 2}}>
        Manage students
      </Typography>
      <Button
        onClick={() => setConfirmOpen(true)}
        disabled={rowSelectionModel.length === 0}
        variant="contained"
        color="error"
      >
        Delete student{rowSelectionModel.length > 1 ? 's' : ''}
      </Button>
      <div style={{height: '30vh'}}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={25}
          checkboxSelection
          onRowSelectionModelChange={newRowSelectionModel => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
          disableRowSelectionOnClick
        />
      </div>
    </>
  );
};

export default ManageStudentsView;
