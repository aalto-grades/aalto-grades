// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Delete} from '@mui/icons-material';
import {Button, Dialog, DialogActions} from '@mui/material';
import {GridActionsCellItem, GridColDef, GridRowsProp} from '@mui/x-data-grid';
import dayjs, {Dayjs} from 'dayjs';
import {enqueueSnackbar} from 'notistack';
import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {NewTaskGrade} from '@/common/types';
import {useGetCourseTasks} from '@/hooks/api/courseTask';
import {useAddGrades} from '@/hooks/useApi';
import UploadDialogConfirm from './UploadDialogConfirm';
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
  const addGrades = useAddGrades(courseId!);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uploadExpanded, setUploadExpanded] = useState<'' | 'upload' | 'edit'>(
    'upload'
  );
  const [confirmExpanded, setConfirmExpanded] = useState<
    '' | 'date' | 'confirm'
  >('date');
  const [rows, setRows] = useState<GridRowsProp<GradeUploadColTypes>>([]);
  const [ready, setReady] = useState<boolean>(true);
  const [dates, setDates] = useState<
    {courseTaskName: string; completionDate: Dayjs; expirationDate: Dayjs}[]
  >([]);

  const courseTaskData = useMemo(
    () => courseTasks.data?.filter(courseTask => !courseTask.archived) ?? [],
    [courseTasks.data]
  );

  const maxGrades = useMemo(
    () =>
      Object.fromEntries(
        courseTaskData.map(courseTask => [courseTask.name, courseTask.maxGrade])
      ),
    [courseTaskData]
  );

  const invalidValues = useMemo(() => {
    for (const row of rows) {
      for (const coursePart of courseTaskData) {
        const grade = row[coursePart.name];
        if (!(coursePart.name in row) || grade === null) continue; // Skip empty cells

        if (coursePart.maxGrade !== null && grade > coursePart.maxGrade)
          return true;
      }
    }
    return false;
  }, [courseTaskData, rows]);

  useEffect(() => {
    if (courseTaskData.length === dates.length) return;
    setDates(
      courseTaskData.map(courseTask => ({
        courseTaskName: courseTask.name,
        completionDate: dayjs(),
        expirationDate: dayjs().add(courseTask.daysValid ?? 0, 'day'), // TODO: Fix
      }))
    );
  }, [courseTaskData, dates.length]);

  const columns: GridColDef<GradeUploadColTypes>[] = [
    {
      field: 'studentNo',
      headerName: t('general.student-number'),
      type: 'string',
      width: 120,
      editable: true,
    },
    ...courseTaskData.map(
      (coursePart): GridColDef<GradeUploadColTypes> => ({
        field: coursePart.name,
        headerName: coursePart.name,
        type: 'number',
        editable: true,
      })
    ),
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
  ];
  const readOnlyColumns: GridColDef<GradeUploadColTypes>[] = [
    {
      field: 'studentNo',
      headerName: t('general.student-number'),
      type: 'string',
    },
    ...courseTaskData.map(
      (coursePart): GridColDef<GradeUploadColTypes> => ({
        field: coursePart.name,
        headerName: coursePart.name,
        type: 'number',
      })
    ),
  ];

  const onSubmit = async (): Promise<void> => {
    const gradeData: NewTaskGrade[] = [];

    for (const row of rows) {
      for (const courseTask of courseTaskData) {
        const grade = row[courseTask.name];
        if (!(courseTask.name in row) || grade === null) continue; // Skip empty cells

        const dateData = dates.find(
          date => date.courseTaskName === courseTask.name
        );
        if (dateData === undefined) {
          console.error('DateData was undefined');
          continue;
        }
        gradeData.push({
          studentNumber: row.studentNo,
          courseTaskId: courseTask.id,
          grade: grade,
          date: dateData.completionDate.toDate(),
          expiryDate: dateData.expirationDate.toDate(),
          comment: '',
        });
      }
    }

    await addGrades.mutateAsync(gradeData);

    enqueueSnackbar(t('course.results.upload.grades-added'), {
      variant: 'success',
    });

    setCurrentStep(0);
    setUploadExpanded('upload');
    setConfirmExpanded('date');
    setRows([]);
    setDates(
      courseTaskData.map(courseTask => ({
        courseTaskName: courseTask.name,
        completionDate: dayjs(),
        expirationDate: dayjs().add(courseTask.daysValid ?? 0, 'day'), // TODO: Fix
      }))
    );
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      {currentStep === 0 ? (
        <UploadDialogUpload
          columns={columns}
          rows={rows}
          maxGrades={maxGrades}
          setRows={setRows}
          setReady={setReady}
          expanded={uploadExpanded}
          setExpanded={setUploadExpanded}
          invalidValues={invalidValues}
        />
      ) : (
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
        {currentStep === 1 && (
          <Button
            onClick={() => setCurrentStep(cur => cur - 1)}
            sx={{mr: 'auto'}}
          >
            {t('general.back')}
          </Button>
        )}
        {currentStep === 0 && (
          <Button
            onClick={() => setCurrentStep(cur => cur + 1)}
            disabled={!ready || rows.length === 0}
          >
            {t('general.next')}
          </Button>
        )}
        {currentStep === 1 && confirmExpanded === 'date' && (
          <Button
            onClick={() => setConfirmExpanded('confirm')}
            disabled={!ready}
          >
            {t('general.confirm')}
          </Button>
        )}
        {currentStep === 1 && confirmExpanded === 'confirm' && (
          <Button onClick={onSubmit}>{t('general.submit')}</Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
export default UploadDialog;
