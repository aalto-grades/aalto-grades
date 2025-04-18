// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
  type GridRowModel,
  type GridRowsProp,
  GridToolbarContainer,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker, useParams} from 'react-router-dom';
import {z} from 'zod';

import {
  type EditFinalGrade,
  type FinalGradeData,
  GradingScale,
  type NewFinalGrade,
  SystemRole,
} from '@/common/types';
import StyledDataGrid from '@/components/shared/StyledDataGrid';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {
  useAddFinalGrades,
  useDeleteFinalGrade,
  useEditFinalGrade,
  useGetAllGradingModels,
  useGetCourse,
} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {findBestFinalGrade, getMaxFinalGrade} from '@/utils';
import type {ColTypeBase} from './EditGradesDialog';

type ColTypes = {
  finalGradeId: number;
  gradingModel: string | null;
  exportDate: Date | null;
  comment: string | null;
} & ColTypeBase;

type PropsType = {
  open: boolean;
  onClose: () => void;
  userId: number;
  title: string | JSX.Element;
  finalGrades: FinalGradeData[];
};
const EditFinalGradesDialog = ({
  open,
  onClose,
  userId,
  title,
  finalGrades,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {auth, isTeacherInCharge} = useAuth();
  const {courseId} = useParams() as {courseId: string};

  const course = useGetCourse(courseId);
  const gradingModels = useGetAllGradingModels(courseId);
  const addFinalGrades = useAddFinalGrades(courseId);
  const editFinalGrade = useEditFinalGrade(courseId);
  const deleteFinalGrade = useDeleteFinalGrade(courseId);

  const getModelName = (modelId: number | null): string | null => {
    if (modelId === null) return null;
    if (gradingModels.data === undefined) return t('general.loading');
    const model = gradingModels.data.find(mod => mod.id === modelId);
    return model?.name ?? t('course.results.not-found');
  };
  const initRows = finalGrades.map((finalGrade, i) => ({
    id: i,
    finalGradeId: finalGrade.id,
    grader: finalGrade.grader.name!,
    grade: finalGrade.grade,
    date: finalGrade.date,
    gradingModel: getModelName(finalGrade.gradingModelId),
    exportDate: finalGrade.sisuExportDate,
    comment: finalGrade.comment,
    selected: '',
  }));

  const [rows, setRows] = useState<GridRowsProp<ColTypes>>(initRows);
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const editRights = useMemo(
    () => auth?.role === SystemRole.Admin || isTeacherInCharge,
    [auth?.role, isTeacherInCharge]
  );

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
          gradingModelId: row.gradingModel === null ? null : 0,
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
      if (changes) e.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [changes]);

  // Update selected column
  useEffect(() => {
    const newRows = rows.map(row => ({
      ...row,
      selected: bestGrade !== null && row.id === bestGrade.id ? 'selected' : '',
    }));
    if (JSON.stringify(rows) !== JSON.stringify(newRows)) setRows(newRows);
  }, [bestGrade, rows]);

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
      headerAlign: 'center',
      editable: editRights,
    },
    {
      field: 'date',
      headerName: t('general.date'),
      type: 'date',
      headerAlign: 'center',
      editable: editRights,
      width: 110, // Enough width to fit the calendar icon
    },
    {
      field: 'gradingModel',
      headerName: t('general.grading-model'),
      type: 'string',
      headerAlign: 'center',
      editable: false,
      width: 120,
    },
    {
      field: 'exportDate',
      headerName: t('general.export-date'),
      type: 'date',
      headerAlign: 'center',
      editable: editRights,
      width: 110, // Enough width to fit the calendar icon
    },
    {
      field: 'comment',
      headerName: t('general.comment'),
      type: 'string',
      headerAlign: 'center',
      editable: editRights,
    },
    ...(editRights
      ? [
          {
            field: 'actions',
            type: 'actions',
            headerName: t('general.actions'),
            getActions: params => [
              <GridActionsCellItem
                key={params.id}
                icon={<Delete />}
                label={t('general.delete')}
                onClick={() =>
                  setRows(oldRows =>
                    oldRows.filter(row => row.id !== params.id)
                  )
                }
              />,
            ],
          } as GridColDef<ColTypes>,
        ]
      : []),
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
        const freeId = Math.max(0, ...oldRows.map(row => row.id)) + 1;
        const newRow: ColTypes = {
          id: freeId,
          finalGradeId: -1,
          grader: auth!.name,
          grade: 0,
          date: new Date(),
          gradingModel: null,
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
          {t('course.results.add-final')}
        </Button>
      </GridToolbarContainer>
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const newGrades: NewFinalGrade[] = [];
    const deletedGrades: number[] = [];
    const editedGrades: {finalGradeId: number; data: EditFinalGrade}[] = [];

    for (const row of rows) {
      if (row.finalGradeId === -1) {
        newGrades.push({
          grade: row.grade,
          date: row.date,
          gradingModelId: null,
          userId,
          comment: row.comment,
        });
      } else {
        editedGrades.push({
          finalGradeId: row.finalGradeId,
          data: {
            grade: row.grade,
            date: row.date,
            sisuExportDate: row.exportDate,
            comment: row.comment,
          },
        });
      }
    }

    const rowIds = new Set(rows.map(row => row.finalGradeId));
    for (const initRow of initRows) {
      if (!rowIds.has(initRow.finalGradeId))
        deletedGrades.push(initRow.finalGradeId);
    }

    await Promise.all([
      addFinalGrades.mutateAsync(newGrades),
      ...deletedGrades.map(async fGradeId =>
        deleteFinalGrade.mutateAsync(fGradeId)
      ),
      ...editedGrades.map(async editData =>
        editFinalGrade.mutateAsync(editData)
      ),
    ]);

    onClose();
    enqueueSnackbar(t('course.results.grades-saved'), {variant: 'success'});
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
          <div style={{height: '35vh'}}>
            <StyledDataGrid
              rows={rows}
              columns={columns}
              rowHeight={25}
              getRowClassName={({row}: {row: ColTypes}) =>
                `row-${row.selected}`
              }
              editMode="row"
              rowSelection={false}
              disableColumnSelector
              slots={editRights ? {toolbar: dataGridToolbar} : {}}
              initialState={{
                sorting: {sortModel: [{field: 'date', sort: 'desc'}]},
              }}
              isCellEditable={(params: GridCellParams<ColTypes>) =>
                params.row.gradingModel === null ||
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

                // Validate final grade
                const maxFinalGrade = getMaxFinalGrade(
                  course.data?.gradingScale ?? GradingScale.Numerical
                );
                const GradeSchema = z.number().int().min(0).max(maxFinalGrade);
                const result = GradeSchema.safeParse(updatedRow.grade);
                if (!result.success)
                  throw new Error(result.error.errors[0].message);

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
              if (changes) confirmDiscard();
              else onClose();
            }}
          >
            {changes ? t('general.discard') : t('general.close')}
          </Button>
          {editRights && (
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
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditFinalGradesDialog;
