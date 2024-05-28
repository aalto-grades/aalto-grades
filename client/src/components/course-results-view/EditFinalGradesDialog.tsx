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
  GridCellParams,
  GridColDef,
  GridRowModel,
  GridRowsProp,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {JSX, useEffect, useMemo, useState} from 'react';
import {useBlocker, useParams} from 'react-router-dom';
import {z} from 'zod';

import {EditFinalGrade, FinalGradeData, NewFinalGrade} from '@/common/types';
import {
  useAddFinalGrades,
  useDeleteFinalGrade,
  useEditFinalGrade,
} from '../../hooks/api/finalGrade';
import {useGetAllAssessmentModels} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {findBestFinalGrade} from '../../utils';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

type ColTypes = {
  id: number;
  finalGradeId: number;
  grader: string;
  grade: number;
  date: Date;
  assessmentModel: string | null;
  exportDate: Date | null;
  comment: string | null;
  selected: string;
};

type PropsType = {
  open: boolean;
  onClose: () => void;
  userId: number;
  title: string;
  finalGrades: FinalGradeData[];
};
const EditFinalGradesDialog = ({
  open,
  onClose,
  userId,
  title,
  finalGrades,
}: PropsType): JSX.Element => {
  const {auth} = useAuth();
  const {courseId} = useParams() as {courseId: string};

  const assessmentModels = useGetAllAssessmentModels(courseId);
  const addFinalGrades = useAddFinalGrades(courseId);
  const deleteFinalGrade = useDeleteFinalGrade(courseId);
  const editFinalGrade = useEditFinalGrade(courseId);

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
      findBestFinalGrade(
        rows.map(row => ({
          ...row,
          assessmentModelId: row.assessmentModel === null ? null : 0,
        }))
      ),
    [rows]
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
    const getModelName = (modelId: number | null): string | null => {
      if (modelId === null) return null;
      if (assessmentModels.data === undefined) return 'Loading...';
      const model = assessmentModels.data.find(mod => mod.id === modelId);
      return model?.name ?? 'Not found';
    };

    const newRows = finalGrades.map((finalGrade, finalGradeId) => ({
      id: finalGradeId,
      finalGradeId: finalGrade.finalGradeId,
      grader: finalGrade.grader.name!,
      grade: finalGrade.grade,
      date: finalGrade.date,
      assessmentModel: getModelName(finalGrade.assessmentModelId),
      exportDate: finalGrade.sisuExportDate,
      comment: finalGrade.comment,
      selected: '',
    }));
    setRows(newRows);
    setInitRows(structuredClone(newRows));
  }, [assessmentModels.data, finalGrades]);

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
      width: 110, // Enough width to fit the calendar icon
    },
    {
      field: 'assessmentModel',
      headerName: 'Grading model name',
      type: 'string',
      editable: false,
    },
    {
      field: 'exportDate',
      headerName: 'Export date',
      type: 'date',
      editable: true,
      width: 110, // Enough width to fit the calendar icon
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
    const addFinalGrade = (): void => {
      setRows(oldRows => {
        const freeId =
          oldRows.reduce((mxVal, row) => Math.max(mxVal, row.id), 0) + 1;
        const newRow: ColTypes = {
          id: freeId,
          finalGradeId: -1,
          grader: auth.name,
          grade: 0,
          date: new Date(),
          assessmentModel: null,
          exportDate: null,
          comment: '',
          selected: '',
        };
        return oldRows.concat(newRow);
      });
    };
    return (
      <GridToolbarContainer>
        <Button startIcon={<Add />} onClick={addFinalGrade}>
          Add Final Grade
        </Button>
      </GridToolbarContainer>
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const newGrades: NewFinalGrade[] = [];
    const deletedGrades: number[] = [];
    const editedGrades: ({finalGradeId: number} & EditFinalGrade)[] = [];

    for (const row of rows) {
      if (row.finalGradeId === -1) {
        newGrades.push({
          grade: row.grade,
          date: row.date,
          assessmentModelId: null,
          userId,
          comment: row.comment,
        });
      } else {
        editedGrades.push({
          finalGradeId: row.finalGradeId,
          grade: row.grade,
          date: row.date,
          sisuExportDate: row.exportDate,
          comment: row.comment,
        });
      }
    }

    const rowIds = rows.map(row => row.finalGradeId);
    for (const initRow of initRows) {
      if (!rowIds.includes(initRow.finalGradeId))
        deletedGrades.push(initRow.finalGradeId);
    }

    await Promise.all([
      addFinalGrades.mutateAsync(newGrades),
      ...deletedGrades.map(fGradeId => deleteFinalGrade.mutateAsync(fGradeId)),
      ...editedGrades.map(finalGrade =>
        editFinalGrade.mutateAsync({
          finalGradeId: finalGrade.finalGradeId,
          data: finalGrade,
        })
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
              initialState={{
                sorting: {sortModel: [{field: 'date', sort: 'desc'}]},
              }}
              isCellEditable={(params: GridCellParams<ColTypes>) =>
                params.row.assessmentModel === null ||
                params.field === 'exportDate' ||
                params.field === 'comment'
              }
              onRowEditStart={() => setEditing(true)}
              onRowEditStop={() => setEditing(false)}
              processRowUpdate={(updatedRow: GridRowModel<ColTypes>) => {
                setRows((oldRows: GridRowsProp<ColTypes>) =>
                  oldRows.map(row =>
                    row.id === updatedRow.id ? updatedRow : row
                  )
                );
                // // TODO: do some validation. Code below is an example.
                for (const [key, val] of Object.entries(updatedRow)) {
                  if (key === 'grade') {
                    const GradeSchema = z.number().int().min(0).max(5);
                    const result = GradeSchema.safeParse(val);
                    if (!result.success)
                      throw new Error(result.error.errors[0].message);
                  }
                }
                // enqueueSnackbar('Row saved!', {variant: 'success'});
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

export default EditFinalGradesDialog;
