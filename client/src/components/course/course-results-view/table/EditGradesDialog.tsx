// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Add, Delete} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  GridActionsCellItem,
  type GridCellParams,
  type GridColDef,
  type GridRowClassNameParams,
  type GridRowModel,
  type GridRowsProp,
  GridToolbarContainer,
  type GridValidRowModel,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker, useParams} from 'react-router-dom';

import type {
  EditTaskGradeData,
  NewTaskGrade,
  TaskGradeData,
} from '@/common/types';
import StyledDataGrid, {
  type GetRowClassName,
  type ProcessRowUpdate,
} from '@/components/shared/StyledDataGrid';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {useTableContext} from '@/context/useTableContext';
import {useAddGrades, useDeleteGrade, useEditGrade} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {findBestGrade} from '@/utils';

type ColTypes = {
  id: number;
  gradeId: number;
  grader: string;
  grade: number;
  date: Date;
  expiryDate: Date | null;
  exported: boolean;
  comment: string;
  selected: string;
  aplusGrade: boolean;
};

type PropsType = {
  open: boolean;
  onClose: () => void;
  studentNumber: string;
  courseTaskId: number;
  maxGrade: number | null;
  title: string;
  grades: TaskGradeData[];
};
const EditGradesDialog = ({
  open,
  onClose,
  studentNumber,
  courseTaskId,
  maxGrade,
  title,
  grades,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {auth} = useAuth();
  const {courseId} = useParams() as {courseId: string};
  const {gradeSelectOption} = useTableContext();

  const addGrades = useAddGrades(courseId);
  const deleteGrade = useDeleteGrade(courseId);
  const editGrade = useEditGrade(courseId);

  const [initRows, setInitRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rows, setRows] = useState<GridRowsProp<ColTypes>>([]);
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const changes = useMemo(
    () =>
      JSON.stringify(rows.map(row => ({...row, selected: ''}))) !==
      JSON.stringify(initRows),
    [initRows, rows]
  );

  const bestGrade = useMemo(
    () =>
      findBestGrade(rows, {
        expiredOption: 'prefer_non_expired',
        gradeSelectOption,
      }),
    [gradeSelectOption, rows]
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
    const newRows = rows.map(row => ({
      ...row,
      selected: bestGrade !== null && row.id === bestGrade.id ? 'selected' : '',
    }));
    if (JSON.stringify(rows) !== JSON.stringify(newRows)) setRows(newRows);
  }, [bestGrade, rows]);

  useEffect(() => {
    const newRows = grades.map((grade, gradeId) => ({
      id: gradeId,
      gradeId: grade.gradeId,
      grader: grade.grader.name!,
      grade: grade.grade,
      date: grade.date,
      expiryDate: grade.expiryDate,
      exported: grade.exportedToSisu !== null,
      comment: grade.comment ?? '',
      selected: '',
      aplusGrade: grade.aplusGradeSource !== null,
    }));
    setRows(newRows);
    setInitRows(structuredClone(newRows));
  }, [grades]);

  if (!auth) return <>Not permitted</>; // Not needed?

  const columns: GridColDef<ColTypes>[] = [
    {
      field: 'grader',
      headerName: t('general.grader'),
      type: 'string',
      editable: false,
    },
    {
      field: 'grade',
      headerName: t('general.grade'),
      type: 'number',
      editable: true,
    },
    {
      field: 'date',
      headerName: t('general.date'),
      type: 'date',
      editable: true,
      width: 120,
    },
    {
      field: 'expiryDate',
      headerName: t('general.expiry-date'),
      type: 'date',
      editable: true,
      width: 120,
    },
    {
      field: 'exported',
      headerName: t('general.exported'),
      type: 'boolean',
      editable: false,
    },
    {
      field: 'comment',
      headerName: t('general.comment'),
      type: 'string',
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: params => [
        <GridActionsCellItem
          key={params.id}
          icon={<Delete />}
          label={t('general.delete')}
          onClick={() =>
            setRows(oldRows => oldRows.filter(row => row.id !== params.id))
          }
        />,
      ],
    },
    {
      field: 'selected',
      type: 'string',
      headerName: '',
      disableColumnMenu: true,
    },
  ];

  const dataGridToolbar = (): JSX.Element => {
    const handleClick = (): void => {
      setRows(oldRows => {
        const freeId = Math.max(1, ...oldRows.map(row => row.id)) + 1;
        const newRow: ColTypes = {
          id: freeId,
          gradeId: -1,
          grader: auth.name,
          grade: 0,
          date: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          exported: false,
          comment: '',
          selected: '',
          aplusGrade: false,
        };
        return oldRows.concat(newRow);
      });
    };
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={handleClick}>
          {t('course.results.add-grade')}
        </Button>
      </GridToolbarContainer>
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const newGrades: NewTaskGrade[] = [];
    const deletedGrades: number[] = [];
    const editedGrades: {gradeId: number; data: EditTaskGradeData}[] = [];

    for (const row of rows) {
      if (row.gradeId === -1) {
        newGrades.push({
          studentNumber,
          courseTaskId,
          grade: row.grade,
          date: row.date,
          expiryDate: row.expiryDate,
          comment: row.comment,
        });
      } else {
        editedGrades.push({
          gradeId: row.gradeId,
          data: {
            grade: row.aplusGrade ? undefined : row.grade,
            date: row.date,
            expiryDate: row.expiryDate,
            comment: row.comment,
          },
        });
      }
    }

    const rowIds = new Set(rows.map(row => row.gradeId));
    for (const initRow of initRows) {
      if (!rowIds.has(initRow.gradeId)) deletedGrades.push(initRow.gradeId);
    }

    await Promise.all([
      addGrades.mutateAsync(newGrades),
      ...deletedGrades.map(async gradeId => deleteGrade.mutateAsync(gradeId)),
      ...editedGrades.map(async editData => editGrade.mutateAsync(editData)),
    ]);

    onClose();
    enqueueSnackbar(t('general.grades-saved'), {variant: 'success'});
    setInitRows(structuredClone(rows));
  };

  type RowType = GridRowModel<ColTypes>;
  const processRowUpdate = (newRow: RowType, oldRow: RowType): RowType => {
    if (!newRow.expiryDate || !oldRow.expiryDate) {
      setError(false);
      return newRow;
    }

    const diff = newRow.date.getTime() - oldRow.date.getTime(); // Diff to update expiration date with

    if (
      diff !== 0 &&
      newRow.expiryDate.getTime() === oldRow.expiryDate.getTime()
    ) {
      newRow.expiryDate = new Date(newRow.expiryDate.getTime() + diff);
    }

    setRows((oldRows: GridRowsProp<ColTypes>) =>
      oldRows.map(row => (row.id === newRow.id ? newRow : row))
    );

    if (newRow.expiryDate < newRow.date)
      throw new Error(t('course.results.expiry-before'));

    setError(false);
    return newRow;
  };

  const getRowClassName = (
    params: GridRowClassNameParams<ColTypes>
  ): string => {
    const invalidValue = maxGrade !== null && params.row.grade > maxGrade;
    return invalidValue ? 'invalid-value-data-grid' : '';
  };

  const confirmDiscard = async (): Promise<void> => {
    if (await AsyncConfirmationModal({confirmNavigate: true})) {
      onClose();
      setRows(structuredClone(initRows));
    }
  };
  return (
    <>
      <UnsavedChangesDialog
        blocker={blocker}
        handleDiscard={() => {
          onClose();
          setRows(structuredClone(initRows));
        }}
      />

      <Dialog
        open={open}
        onClose={() => {
          if (changes) confirmDiscard();
          else onClose();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div style={{height: '30vh'}}>
            <StyledDataGrid
              rows={rows}
              columns={columns as GridColDef<GridValidRowModel>[]}
              rowHeight={25}
              editMode="row"
              rowSelection={false}
              disableColumnSelector
              slots={{toolbar: dataGridToolbar}}
              sx={{maxHeight: '70vh', minHeight: '20vh'}}
              initialState={{
                sorting: {sortModel: [{field: 'date', sort: 'desc'}]},
              }}
              onRowEditStart={() => setEditing(true)}
              onRowEditStop={() => setEditing(false)}
              isCellEditable={(params: GridCellParams<ColTypes>) =>
                !(params.row.aplusGrade && params.field === 'grade')
              }
              processRowUpdate={processRowUpdate as unknown as ProcessRowUpdate}
              onProcessRowUpdateError={(rowError: Error) => {
                setError(true);
                enqueueSnackbar(rowError.message, {variant: 'error'});
              }}
              getRowClassName={getRowClassName as unknown as GetRowClassName}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (changes) confirmDiscard();
              else onClose();
            }}
          >
            {changes ? t('general.discard') : t('general.close')}
          </Button>
          <Button
            onClick={() => {
              if (changes) handleSubmit();
              else onClose();
            }}
            variant={changes ? 'contained' : 'text'}
            disabled={error || editing}
          >
            {t('general.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditGradesDialog;
