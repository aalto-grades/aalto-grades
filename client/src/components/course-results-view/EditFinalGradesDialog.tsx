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

import {EditFinalGrade, FinalGradeData, NewFinalGrade} from '@/common/types';
import {useTableContext} from '../../context/useTableContext';
import {
  useAddFinalGrades,
  useDeleteFinalGrade,
  useEditFinalGrade,
} from '../../hooks/api/finalGrade';
import {useGetAllAssessmentModels} from '../../hooks/useApi';
import useAuth from '../../hooks/useAuth';
import {findBestGrade} from '../../utils';
import UnsavedChangesDialog from '../alerts/UnsavedChangesDialog';

type ColTypes = {
  id: number;
  fgradeId: number;
  grader: string;
  grade: number;
  date: Date;
  assessmentModel: string;
  exported: boolean;
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
  const {gradeSelectOption} = useTableContext();

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
    const newRows = finalGrades.map((grade, gradeId) => {
      let modelName = '';
      if (grade.assessmentModelId === null) modelName = 'Manual';
      else if (assessmentModels.data === undefined) modelName = 'Loading';
      else
        modelName =
          assessmentModels.data.find(
            model => model.id === grade.assessmentModelId
          )?.name ?? 'Not found';

      return {
        id: gradeId,
        fgradeId: grade.finalGradeId,
        grader: grade.grader.name!,
        grade: grade.grade,
        date: grade.date,
        assessmentModel: modelName,
        exported: grade.sisuExportDate !== null,
        selected: '',
      };
    });
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
      width: 120,
    },
    {
      field: 'assessmentModel',
      headerName: 'Assessment model name',
      type: 'string',
      editable: false,
    },
    {
      field: 'exported',
      headerName: 'Exported',
      type: 'boolean',
      editable: false,
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
          fgradeId: -1,
          grader: auth.name,
          grade: 0,
          date: new Date(),
          assessmentModel: 'Manual',
          exported: false,
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
    const newGrades: NewFinalGrade[] = [];
    const deletedGrades: number[] = [];
    const editedGrades: ({fGradeId: number} & EditFinalGrade)[] = [];

    for (const row of rows) {
      if (row.fgradeId === -1) {
        newGrades.push({
          grade: row.grade,
          date: row.date,
          assessmentModelId: null,
          userId,
        });
      } else {
        editedGrades.push({
          fGradeId: row.fgradeId,
          grade: row.grade,
          date: row.date,
        });
      }
    }

    const rowIds = rows.map(row => row.fgradeId);
    for (const initRow of initRows) {
      if (!rowIds.includes(initRow.fgradeId))
        deletedGrades.push(initRow.fgradeId);
    }

    await Promise.all([
      addFinalGrades.mutateAsync(newGrades),
      ...deletedGrades.map(fGradeId => deleteFinalGrade.mutateAsync(fGradeId)),
      ...editedGrades.map(grade =>
        editFinalGrade.mutateAsync({fGradeId: grade.fGradeId, data: grade})
      ),
    ]);

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
            processRowUpdate={(updatedRow: GridRowModel<ColTypes>) => {
              setRows((oldRows: GridRowsProp<ColTypes>) =>
                oldRows.map(row =>
                  row.id === updatedRow.id ? updatedRow : row
                )
              );
              // // TODO: do some validation. Code below is an example.
              // for (const [key, val] of Object.entries(updatedRow)) {
              //   if (key === 'id' || key === 'StudentNo') continue;
              //   if ((val as number) < 0)
              //     throw new Error('Value cannot be negative');
              //   else if ((val as number) > 5000)
              //     throw new Error('Value cannot be over 5000');
              // }
              // enqueueSnackbar('Row saved!', {variant: 'success'});
              setError(false);
              return updatedRow;
            }}
            onProcessRowUpdateError={(rowError: Error) => {
              setError(true);
              enqueueSnackbar(rowError.message, {variant: 'error'});
            }}
          />
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
