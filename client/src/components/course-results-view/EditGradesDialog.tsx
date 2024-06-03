// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
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
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowModel,
  GridRowsProp,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useMemo, useState} from 'react';
import {useBlocker, useParams} from 'react-router-dom';

import {EditGradeData, GradeData, NewGrade} from '@/common/types';
import {useTableContext} from '../../context/useTableContext';
import {useAddGrades, useDeleteGrade, useEditGrade} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {findBestGrade} from '../../utils/bestGrade';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

type ColTypes = {
  id: number;
  gradeId: number;
  grader: string;
  grade: number;
  date: Date;
  expiryDate: Date;
  exported: boolean;
  comment: string;
  selected: string;
};

type PropsType = {
  open: boolean;
  onClose: () => void;
  studentNumber: string;
  coursePartId: number;
  title: string;
  grades: GradeData[];
};
const EditGradesDialog = ({
  open,
  onClose,
  studentNumber,
  coursePartId,
  title,
  grades,
}: PropsType): JSX.Element => {
  const {auth} = useAuth();
  const {courseId} = useParams() as {courseId: string};
  const {gradeSelectOption} = useTableContext();

  const addGrades = useAddGrades(courseId);
  const deleteGrade = useDeleteGrade(courseId);
  const editGrade = useEditGrade(courseId);

  const [initRows, setInitRows] = useState<GridRowsProp<ColTypes>>([]);
  const [rows, setRows] = useState<GridRowsProp<ColTypes>>([]);
  const [unsavedOpen, setUnsavedOpen] = useState<boolean>(false);
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
    }));
    setRows(newRows);
    setInitRows(structuredClone(newRows));
  }, [grades]);

  if (!auth) return <>Not permitted</>; // Not needed?

  const columns: GridColDef<ColTypes>[] = [
    {
      field: 'grader',
      headerName: 'Grader',
      type: 'string',
      editable: false,
    },
    {
      field: 'grade',
      headerName: 'Grade',
      type: 'number',
      editable: true,
    },
    {
      field: 'date',
      headerName: 'Date',
      type: 'date',
      editable: true,
      width: 120,
    },
    {
      field: 'expiryDate',
      headerName: 'Expiry Date',
      type: 'date',
      editable: true,
      width: 120,
    },
    {
      field: 'exported',
      headerName: 'Exported',
      type: 'boolean',
      editable: false,
    },
    {
      field: 'comment',
      headerName: 'Comment',
      type: 'string',
      editable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: params => [
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
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
        const freeId =
          oldRows.reduce((mxVal, row) => Math.max(mxVal, row.id), 0) + 1;
        const newRow: ColTypes = {
          id: freeId,
          gradeId: -1,
          grader: auth.name,
          grade: 0,
          date: new Date(),
          expiryDate: new Date(
            new Date().getTime() + 365 * 24 * 60 * 60 * 1000
          ),
          exported: false,
          comment: '',
          selected: '',
        };
        return oldRows.concat(newRow);
      });
    };
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={handleClick}>
          Add Grade
        </Button>
      </GridToolbarContainer>
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const newGrades: NewGrade[] = [];
    const deletedGrades: number[] = [];
    const editedGrades: ({gradeId: number} & EditGradeData)[] = [];

    for (const row of rows) {
      if (row.gradeId === -1) {
        newGrades.push({
          studentNumber,
          coursePartId,
          grade: row.grade,
          date: row.date,
          expiryDate: row.expiryDate,
          comment: row.comment,
        });
      } else {
        editedGrades.push({
          gradeId: row.gradeId,
          grade: row.grade,
          date: row.date,
          expiryDate: row.expiryDate,
          comment: row.comment,
        });
      }
    }

    const rowIds = rows.map(row => row.gradeId);
    for (const initRow of initRows) {
      if (!rowIds.includes(initRow.gradeId))
        deletedGrades.push(initRow.gradeId);
    }

    await Promise.all([
      addGrades.mutateAsync(newGrades),
      ...deletedGrades.map(gradeId => deleteGrade.mutateAsync(gradeId)),
      ...editedGrades.map(grade =>
        editGrade.mutateAsync({gradeId: grade.gradeId, data: grade})
      ),
    ]);

    onClose();
    enqueueSnackbar('Grades saved successfully', {variant: 'success'});
    setInitRows(structuredClone(rows));
  };

  return (
    <>
      <UnsavedChangesDialog
        open={unsavedOpen || blocker.state === 'blocked'}
        onClose={() => {
          setUnsavedOpen(false);
          if (blocker.state === 'blocked') blocker.reset();
        }}
        handleDiscard={() => {
          onClose();
          setRows(structuredClone(initRows));
          if (blocker.state === 'blocked') {
            blocker.proceed();
          }
        }}
      />

      <Dialog
        open={open}
        onClose={() => {
          if (changes) setUnsavedOpen(true);
          else onClose();
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <div style={{height: '30vh'}}>
            <DataGrid
              rows={rows}
              columns={columns}
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
              processRowUpdate={(
                updatedRow: GridRowModel<ColTypes>,
                oldRow: GridRowModel<ColTypes>
              ) => {
                const diff = updatedRow.date.getTime() - oldRow.date.getTime(); // Diff to update expiration date with

                if (
                  diff !== 0 &&
                  updatedRow.expiryDate.getTime() ===
                    oldRow.expiryDate.getTime()
                ) {
                  updatedRow.expiryDate = new Date(
                    updatedRow.expiryDate.getTime() + diff
                  );
                }

                setRows((oldRows: GridRowsProp<ColTypes>) =>
                  oldRows.map(row =>
                    row.id === updatedRow.id ? updatedRow : row
                  )
                );

                if (updatedRow.expiryDate < updatedRow.date)
                  throw new Error('Expiry date cannot be before date');

                setError(false);
                return updatedRow;
              }}
              onProcessRowUpdateError={(rowError: Error) => {
                setError(true);
                enqueueSnackbar(rowError.message, {variant: 'error'});
              }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (changes) setUnsavedOpen(true);
              else onClose();
            }}
          >
            {changes ? 'Discard' : 'Close'}
          </Button>
          <Button
            onClick={() => {
              if (changes) handleSubmit();
              else onClose();
            }}
            variant={changes ? 'contained' : 'text'}
            disabled={error || editing}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditGradesDialog;
