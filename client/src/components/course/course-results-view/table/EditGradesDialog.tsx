// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Add, Delete, History} from '@mui/icons-material';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  GridActionsCellItem,
  type GridCellParams,
  type GridColDef,
  type GridRowClassNameParams,
  type GridRowModel,
  type GridRowsProp,
  type GridValidRowModel,
  Toolbar,
  useGridApiRef,
} from '@mui/x-data-grid';
import {enqueueSnackbar} from 'notistack';
import {type JSX, forwardRef, useEffect, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useBlocker, useParams} from 'react-router-dom';

import type {
  EditTaskGradeData,
  NewTaskGrade,
  StudentData,
  TaskGradeData,
} from '@/common/types';
import GradesHistoryDialog from '@/components/course/course-results-view/HistoryDialog';
import StyledDataGrid, {
  type GetRowClassName,
  type ProcessRowUpdate,
} from '@/components/shared/StyledDataGrid';
import UnsavedChangesDialog from '@/components/shared/UnsavedChangesDialog';
import {useTableContext} from '@/context/useTableContext';
import {
  useAddGrades,
  useDeleteGrade,
  useEditGrade,
  useGetCourseParts,
  useGetCourseTasks,
} from '@/hooks/useApi';
import useAuth from '@/hooks/useAuth';
import {findBestGrade, getCoursePartExpiryDate} from '@/utils';

type HistoryButtonProps = {
  courseTaskId: number;
  studentUser: StudentData;
};

const HistoryButton = forwardRef<HTMLSpanElement, HistoryButtonProps>(
  ({courseTaskId, studentUser}): JSX.Element => {
    const {t} = useTranslation();
    const [historyOpen, setHistoryOpen] = useState<boolean>(false);

    return (
      <>
        <Tooltip title={t('course.results.history')}>
          <IconButton onClick={() => setHistoryOpen(true)}>
            <History />
          </IconButton>
        </Tooltip>
        <GradesHistoryDialog
          studentUser={studentUser}
          courseTaskId={courseTaskId}
          open={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />
      </>
    );
  }
);
HistoryButton.displayName = 'HistoryButton';

export type ColTypeBase = {
  id: number;
  grader: string;
  selected: string;
  grade: number;
  date: Date;
};

type ColTypes = {
  gradeId: number;
  expiryDate: Date | null;
  comment: string;
  aplusGrade: boolean;
} & ColTypeBase;

type PropsType = {
  open: boolean;
  onClose: () => void;
  studentUser: StudentData;
  courseTaskId: number;
  maxGrade: number | null;
  title: string | JSX.Element;
  grades: TaskGradeData[];
};
const EditGradesDialog = ({
  open,
  onClose,
  studentUser,
  courseTaskId,
  maxGrade,
  title,
  grades,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {auth} = useAuth();
  const {courseId} = useParams() as {courseId: string};
  const {gradeSelectOption} = useTableContext();
  const apiRef = useGridApiRef();

  const courseParts = useGetCourseParts(courseId);
  const courseTasks = useGetCourseTasks(courseId);
  const addGrades = useAddGrades(courseId);
  const editGrade = useEditGrade(courseId);
  const deleteGrade = useDeleteGrade(courseId);

  const initRows = grades.map((grade, i) => ({
    id: i,
    gradeId: grade.id,
    grader: grade.grader.name!,
    grade: grade.grade,
    date: grade.date,
    expiryDate: grade.expiryDate,
    comment: grade.comment ?? '',
    selected: '',
    aplusGrade: grade.aplusGradeSource !== null,
  }));

  const [rows, setRows] = useState<GridRowsProp<ColTypes>>(initRows);
  const [editing, setEditing] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [tableKey, setTableKey] = useState<number>(0);

  const changes = useMemo(
    () =>
      JSON.stringify(rows.map(row => ({...row, selected: ''})))
      !== JSON.stringify(initRows),
    [initRows, rows]
  );

  const coursePartExipryDate = useMemo(() => {
    return getCoursePartExpiryDate(
      courseParts.data,
      courseTasks.data,
      courseTaskId
    );
  }, [courseParts, courseTasks, courseTaskId]);

  const bestGrade = useMemo(
    () =>
      findBestGrade(rows, coursePartExipryDate, {
        expiredOption: 'non_expired',
        gradeSelectOption,
      }),
    [gradeSelectOption, rows, coursePartExipryDate]
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
  if (rows.find(row => row.selected === 'selected')?.id !== bestGrade?.id) {
    setRows(oldRows => oldRows.map(row => ({
      ...row,
      selected: bestGrade !== null && row.id === bestGrade.id ? 'selected' : '',
    })));
    setTableKey(oldKey => oldKey + 1);
  }

  const courseTask =
    courseTasks.data?.find(task => task.id === courseTaskId) ?? null;

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
      // width: 120,
    },
    {
      field: 'expiryDate',
      headerName: t('general.expiry-date'),
      type: 'date',
      editable: true,
      // width: 120,
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
            setRows(oldRows => oldRows.filter(row => row.id !== params.id))}
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
      setRows((oldRows) => {
        const freeId = Math.max(0, ...oldRows.map(row => row.id)) + 1;
        const newRow: ColTypes = {
          id: freeId,
          gradeId: -1,
          grader: auth!.name,
          grade: 0,
          date: new Date(),
          expiryDate: courseTask?.daysValid
            ? new Date(Date.now() + courseTask.daysValid * 24 * 60 * 60 * 1000)
            : null,
          comment: '',
          selected: '',
          aplusGrade: false,
        };
        return oldRows.concat(newRow);
      });
    };
    return (
      <Toolbar>
        <Button startIcon={<Add />} onClick={handleClick}>
          {t('course.results.add-grade')}
        </Button>
      </Toolbar>
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const newGrades: NewTaskGrade[] = [];
    const deletedGrades: number[] = [];
    const editedGrades: {gradeId: number; data: EditTaskGradeData}[] = [];

    /**
     * Replacer function used in the JSON.stringify cxomparison, ignore the
     * 'selected' property by returning undefined
     */
    const ignoreSelectedColumn = (
      key: string,
      value: ColTypes[keyof ColTypes]
    ): ColTypes[keyof ColTypes] | undefined => {
      if (key === 'selected') {
        return undefined;
      }
      return value;
    };

    for (const row of rows) {
      if (row.gradeId === -1) {
        newGrades.push({
          studentNumber: studentUser.studentNumber,
          courseTaskId: courseTaskId,
          aplusGradeSourceId: null,
          grade: row.grade,
          date: row.date,
          expiryDate: row.expiryDate,
          comment: row.comment,
        });
      }
    }

    const rowIds = new Set(rows.map(row => row.gradeId));
    for (const initRow of initRows) {
      if (!rowIds.has(initRow.gradeId)) {
        deletedGrades.push(initRow.gradeId);
      } else {
        const newRow = rows.find(row => row.gradeId === initRow.gradeId);
        if (
          JSON.stringify(newRow, ignoreSelectedColumn)
          !== JSON.stringify(initRow, ignoreSelectedColumn)
        ) {
          editedGrades.push({
            gradeId: newRow!.gradeId,
            data: {
              grade: newRow!.aplusGrade ? undefined : newRow!.grade,
              date: newRow!.date,
              expiryDate: newRow!.expiryDate,
              comment: newRow!.comment,
            },
          });
        }
      }
    }
    await Promise.all([
      addGrades.mutateAsync(newGrades),
      ...deletedGrades.map(async gradeId => deleteGrade.mutateAsync(gradeId)),
      ...editedGrades.map(async editData => editGrade.mutateAsync(editData)),
    ]);

    onClose();
    enqueueSnackbar(t('general.grades-saved'), {variant: 'success'});
  };

  type RowType = GridRowModel<ColTypes>;
  const processRowUpdate = (newRow: RowType, oldRow: RowType): RowType => {
    if (!newRow.expiryDate || !oldRow.expiryDate) {
      setError(false);
      setRows((oldRows: GridRowsProp<ColTypes>) =>
        oldRows.map(row => (row.id === newRow.id ? newRow : row))
      );
      return newRow;
    }

    const diff = newRow.date.getTime() - oldRow.date.getTime(); // Diff to update expiration date with

    if (
      diff !== 0
      && newRow.expiryDate.getTime() === oldRow.expiryDate.getTime()
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
        <DialogTitle>
          {title}
          <HistoryButton
            studentUser={studentUser}
            courseTaskId={courseTaskId}
          />
        </DialogTitle>

        <DialogContent>
          <div style={{height: '30vh'}}>
            <StyledDataGrid
              key={tableKey}
              apiRef={apiRef}
              rows={rows}
              columns={columns as GridColDef<GridValidRowModel>[]}
              rowHeight={25}
              editMode="row"
              rowSelection={false}
              disableColumnSelector
              autosizeOnMount
              showToolbar
              slots={{toolbar: dataGridToolbar}}
              sx={{maxHeight: '70vh', minHeight: '20vh'}}
              initialState={{
                sorting: {sortModel: [{field: 'date', sort: 'desc'}]},
              }}
              onRowEditStart={() => setEditing(true)}
              onRowEditStop={() => setEditing(false)}
              isCellEditable={(params: GridCellParams<ColTypes>) =>
                !(params.row.aplusGrade && params.field === 'grade')}
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
