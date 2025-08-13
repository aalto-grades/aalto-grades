// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Delete} from '@mui/icons-material';
import {Button, DialogActions} from '@mui/material';
import {
  GridActionsCellItem,
  type GridColDef,
  type GridRowsProp,
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
import {enqueueSnackbar} from 'notistack';
import {type JSX, useMemo, useState} from 'react';
import {AsyncConfirmationModal} from 'react-global-modal';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {
  CoursePartData,
  CourseTaskData,
  NewTaskGrade,
} from '@/common/types';
import Dialog from '@/components/shared/Dialog';
import {useAddGrades, useGetCourseTasks} from '@/hooks/useApi';
import UploadDialogConfirm, {type DateType} from './UploadDialogConfirm';
import UploadDialogSelectCoursePart from './UploadDialogSelectCoursePart';
import UploadDialogUpload from './UploadDialogUpload';

export type GradeUploadColTypes = {[key: string]: number | null} & {
  id: number;
  studentNo: string;
};

type PropsType = {open: boolean; onClose: () => void};
const UploadDialog = ({open, onClose}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams();
  const courseTasks = useGetCourseTasks(courseId!, {
    enabled: Boolean(courseId),
  });
  const {mutateAsync: addGrades, isPending} = useAddGrades(courseId!);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uploadExpanded, setUploadExpanded] = useState<'' | 'upload' | 'edit'>(
    'upload'
  );
  const [confirmExpanded, setConfirmExpanded] = useState<
    '' | 'date' | 'confirm'
  >('date');

  const [coursePart, setCoursePart] = useState<CoursePartData | null>(null);
  const [rows, setRows] = useState<GridRowsProp<GradeUploadColTypes>>([]);
  const [ready, setReady] = useState<boolean>(true);
  const [dates, setDates] = useState<DateType[]>([]);

  const courseTaskData = useMemo(
    () =>
      courseTasks.data?.filter(
        task => task.coursePartId === coursePart?.id && !task.archived
      ) ?? [],
    [coursePart?.id, courseTasks.data]
  );

  const maxGrades = useMemo(
    () =>
      Object.fromEntries(
        courseTaskData.map(task => [task.name, task.maxGrade])
      ),
    [courseTaskData]
  );

  const invalidValues = useMemo(() => {
    for (const row of rows) {
      for (const task of courseTaskData) {
        const grade = row[task.name];
        if (!(task.name in row) || grade === null) continue; // Skip empty cells

        if (task.maxGrade !== null && grade > task.maxGrade) return true;
      }
    }
    return false;
  }, [courseTaskData, rows]);

  const [oldCourseTaskData, setOldCourseTaskData] = useState<
    CourseTaskData[] | null
  >(null);
  if (oldCourseTaskData !== courseTaskData) {
    setOldCourseTaskData(courseTaskData);

    setDates(
      courseTaskData.map(task => ({
        courseTaskName: task.name,
        completionDate: dayjs(),
        expirationDate:
          task.daysValid === null ? null : dayjs().add(task.daysValid, 'day'),
      }))
    );
  }

  const columns: GridColDef<GradeUploadColTypes>[] = [
    {
      field: 'studentNo',
      headerName: t('general.student-number'),
      type: 'string',
      width: 120,
      editable: true,
    },
    ...courseTaskData.map(
      (task): GridColDef<GradeUploadColTypes> => ({
        field: task.name,
        headerName: task.name,
        type: 'number',
        editable: true,
      })
    ),
    {
      field: 'actions',
      type: 'actions',
      headerName: t('general.delete'),
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
  ];
  const readOnlyColumns: GridColDef<GradeUploadColTypes>[] = [
    {
      field: 'studentNo',
      headerName: t('general.student-number'),
      type: 'string',
    },
    ...courseTaskData.map(
      (task): GridColDef<GradeUploadColTypes> => ({
        field: task.name,
        headerName: task.name,
        type: 'number',
      })
    ),
  ];

  const reset = (): void => {
    setCurrentStep(0);
    setCoursePart(null);
    setUploadExpanded('upload');
    setConfirmExpanded('date');
    setRows([]);
    setDates(
      courseTaskData.map(task => ({
        courseTaskName: task.name,
        completionDate: dayjs(),
        expirationDate:
          task.daysValid === null ? null : dayjs().add(task.daysValid, 'day'),
      }))
    );
  };

  const onSubmit = async (): Promise<void> => {
    const gradeData: NewTaskGrade[] = [];

    for (const row of rows) {
      for (const courseTask of courseTaskData) {
        const grade = row[courseTask.name];
        if (!(courseTask.name in row) || grade === null) continue; // Skip empty cells

        const dateData = dates.find(
          date => date.courseTaskName === courseTask.name
        )!;
        gradeData.push({
          studentNumber: row.studentNo,
          courseTaskId: courseTask.id,
          aplusGradeSourceId: null,
          grade: grade,
          date: dateData.completionDate.toDate(),
          expiryDate: dateData.expirationDate?.toDate() ?? null,
          comment: '',
        });
      }
    }

    await addGrades(gradeData);

    enqueueSnackbar(t('course.results.upload.grades-added'), {
      variant: 'success',
    });

    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      disableBackdropClick
      maxWidth="xl"
      disableCloseButton={isPending}
    >
      {currentStep === 0 && (
        <UploadDialogSelectCoursePart
          setCoursePart={(newCoursePart) => {
            setCoursePart(newCoursePart);
            setCurrentStep(1);
            setReady(true);
          }}
        />
      )}
      {currentStep === 1 && (
        <UploadDialogUpload
          coursePart={coursePart}
          columns={columns}
          rows={rows}
          maxGrades={maxGrades}
          setRows={setRows}
          setReady={setReady}
          expanded={uploadExpanded}
          setExpanded={setUploadExpanded}
          invalidValues={invalidValues}
        />
      )}
      {currentStep === 2 && (
        <UploadDialogConfirm
          columns={readOnlyColumns}
          rows={rows}
          maxGrades={maxGrades}
          dates={dates}
          setDates={setDates}
          setReady={setReady}
          expanded={confirmExpanded}
          setExpanded={setConfirmExpanded}
          invalidValues={invalidValues}
        />
      )}

      <DialogActions>
        {currentStep > 0 && (
          <Button
            onClick={async () => {
              if (currentStep === 1 && rows.length > 0) {
                const confirm = await AsyncConfirmationModal({
                  confirmDiscard: true,
                });
                if (confirm) reset();
                return;
              }
              setCurrentStep(cur => cur - 1);
              setReady(true);
            }}
            sx={{mr: 'auto'}}
          >
            {t('general.back')}
          </Button>
        )}
        {currentStep === 1 && (
          <Button
            onClick={() => setCurrentStep(cur => cur + 1)}
            disabled={!ready || rows.length === 0}
          >
            {t('general.next')}
          </Button>
        )}
        {currentStep === 2 && confirmExpanded === 'date' && (
          <Button
            onClick={() => setConfirmExpanded('confirm')}
            disabled={!ready || isPending}
          >
            {t('general.confirm')}
          </Button>
        )}
        {currentStep === 2 && confirmExpanded === 'confirm' && (
          <Button disabled={isPending} onClick={onSubmit}>
            {t('general.submit')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
export default UploadDialog;
