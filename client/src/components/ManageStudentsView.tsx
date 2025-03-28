// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Box, Button, Typography} from '@mui/material';
import {
  type GridColDef,
  type GridRowSelectionModel,
  type GridRowsProp,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker} from 'react-router-dom';

import DataGridBase from '@/components/shared/DataGridBase';
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
      if (changes) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [changes]);

  // Update rows when student data loads / changes
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
      valueGetter: (params: string | null) => params ?? '-',
    },
    {
      field: 'studentNumber',
      headerName: t('general.student-number'),
      type: 'string',
      editable: false,
      width: 200,
    },
    {
      field: 'email',
      headerName: t('general.email'),
      type: 'string',
      editable: false,
      width: 250,
      valueGetter: (params: string | null) => params ?? '-',
    },
    {
      field: 'latestGrade',
      headerName: t('manage-students.latest-grade'),
      type: 'date',
      editable: false,
      width: 200,
    },
  ];

  const handleDelete = async (): Promise<void> => {
    const confirmation = await AsyncConfirmationModal({
      title: t('manage-students.delete', {count: rowSelectionModel.length}),
      message: t('manage-students.delete-message', {
        count: rowSelectionModel.length,
      }),
      confirmDelete: true,
    });
    if (confirmation) {
      await deleteUsers.mutateAsync(rowSelectionModel.map(row => Number(row)));
      enqueueSnackbar(
        t('manage-students.delete-success', {count: rowSelectionModel.length}),
        {variant: 'success'}
      );
      setRowSelectionModel([]);
    }
  };

  return (
    <>
      <UnsavedChangesDialog blocker={blocker} />
      <Typography variant="h2" sx={{my: 1}}>
        {t('manage-students.title')}
      </Typography>
      <div style={{height: '90%'}}>
        <DataGridBase
          rows={rows}
          columns={columns}
          rowHeight={25}
          checkboxSelection
          onRowSelectionModelChange={newRowSelectionModel => {
            setRowSelectionModel(newRowSelectionModel);
          }}
          rowSelectionModel={rowSelectionModel}
          disableRowSelectionOnClick
          slots={{
            toolbar: () => {
              return (
                <GridToolbarContainer sx={{mb: 1}}>
                  <GridToolbarColumnsButton />
                  <GridToolbarFilterButton />
                  <Box sx={{flexGrow: 1}} />
                  <Button
                    onClick={handleDelete}
                    disabled={rowSelectionModel.length === 0}
                    variant="contained"
                    color="error"
                    size="small"
                  >
                    {t('manage-students.delete', {
                      count: rowSelectionModel.length,
                    })}
                  </Button>
                </GridToolbarContainer>
              );
            },
          }}
        />
      </div>
    </>
  );
};

export default ManageStudentsView;
