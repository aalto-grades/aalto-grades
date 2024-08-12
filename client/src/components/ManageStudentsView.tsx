// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Button, Typography} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridRowsProp,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker} from 'react-router-dom';

import {
  useDeleteUsers,
  useGetLatestGrades,
  useGetStudents,
} from '@/hooks/useApi';
import UnsavedChangesDialog from './shared/UnsavedChangesDialog';

type ColTypes = {
  id: number;
  name: string | null;
  studentNumber: string | null;
  email: string | null;
  latestGrade: Date | null;
};

const ManageStudentsView = (): JSX.Element => {
  const {t} = useTranslation();
  const students = useGetStudents();
  const deleteUsers = useDeleteUsers();
  const getLatestGrades = useGetLatestGrades();

  const [initRows, setInitRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rows, setRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rowSelectionModel, setRowSelectionModel] =
    useState<GridRowSelectionModel>([]);

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

  const [oldStudentData, setOldStudentData] =
    useState<typeof students.data>(undefined);
  if (students.data !== oldStudentData) {
    setOldStudentData(students.data);

    const setData = async (): Promise<void> => {
      if (students.data === undefined) return;
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
  }

  const columns: GridColDef<ColTypes>[] = [
    {
      field: 'name',
      headerName: t('general.name'),
      type: 'string',
      editable: false,
      width: 200,
    },
    {
      field: 'studentNumber',
      headerName: t('general.student-number'),
      type: 'string',
      editable: false,
      width: 120,
    },
    {
      field: 'email',
      headerName: t('general.email'),
      type: 'string',
      editable: false,
      width: 150,
    },
    {
      field: 'latestGrade',
      headerName: t('manage-students.latest-grade'),
      type: 'date',
      editable: false,
      width: 150,
    },
  ];

  const plural = rowSelectionModel.length > 1;
  const handleDelete = async (): Promise<void> => {
    const confirmation = await AsyncConfirmationModal({
      title: plural
        ? t('manage-students.delete.plural')
        : t('manage-students.delete.singular'),
      message: plural
        ? t('manage-students.delete-message.plural')
        : t('manage-students.delete-message.singular'),
      confirmDelete: true,
    });
    if (confirmation) {
      await deleteUsers.mutateAsync(rowSelectionModel.map(row => Number(row)));
      enqueueSnackbar(
        plural
          ? t('manage-students.delete-success.plural')
          : t('manage-students.delete-success.singular'),
        {variant: 'success'}
      );
      setRowSelectionModel([]);
    }
  };

  return (
    <>
      <UnsavedChangesDialog blocker={blocker} />

      <Typography variant="h2" sx={{pb: 2}}>
        {t('manage-students.title')}
      </Typography>
      <Button
        onClick={handleDelete}
        disabled={rowSelectionModel.length === 0}
        variant="contained"
        color="error"
      >
        {plural
          ? t('manage-students.delete.plural')
          : t('manage-students.delete.singular')}
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
