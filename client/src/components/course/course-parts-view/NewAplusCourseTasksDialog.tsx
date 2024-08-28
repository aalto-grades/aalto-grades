// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {type JSX, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import type {
  AplusCourseData,
  EditCourseTaskData,
  NewAplusGradeSourceData,
  NewCourseTaskData,
} from '@/common/types';
import {aplusGradeSourcesEqual} from '@/common/util';
import AplusTokenDialog from '@/components/shared/auth/AplusTokenDialog';
import {
  useAddAplusGradeSources,
  useAddCourseTask,
  useFetchAplusCourses,
} from '@/hooks/useApi';
import {getAplusToken} from '@/utils';
import CreateAplusCourseTasks from './CreateAplusCourseTasks';
import SelectAplusCourse from './SelectAplusCourse';
import SelectAplusGradeSources from './SelectAplusGradeSources';

type PropsType = {
  open: boolean;
  onClose: () => void;
  coursePartId: number | null;
};

const NewAplusCourseTasksDialog = ({
  open,
  onClose,
  coursePartId,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const aplusCourses = useFetchAplusCourses({
    enabled: Boolean(getAplusToken()),
  });
  const addCourseTask = useAddCourseTask(courseId);
  const addAplusGradeSources = useAddAplusGradeSources(courseId);

  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const [courseTasksWithSource, setCourseTasksWithSource] = useState<
    [NewCourseTaskData, NewAplusGradeSourceData][]
  >([]);

  useEffect(() => {
    setAplusTokenDialogOpen(!getAplusToken() || aplusCourses.isError);
  }, [open, aplusCourses]);

  const handleResetAndClose = (): void => {
    setStep(0);
    setAplusCourse(null);
    setCourseTasksWithSource([]);
    onClose();
  };

  const handleSelectionChange = (
    checked: boolean,
    name: string,
    maxGrade: number,
    source: NewAplusGradeSourceData
  ): void => {
    if (checked) {
      // Cannot use concat for some reason
      setCourseTasksWithSource(oldTasks => [
        ...oldTasks,
        [
          {
            name: name,
            coursePartId: coursePartId!,
            daysValid: null,
            maxGrade: maxGrade,
          },
          source,
        ],
      ]);
    } else {
      setCourseTasksWithSource(oldTasks =>
        oldTasks.filter(
          ([_, oldSource]) => !aplusGradeSourcesEqual(oldSource, source)
        )
      );
    }
  };

  const handleCourseTaskChange = (
    index: number,
    courseTaskEdit: EditCourseTaskData
  ): void => {
    setCourseTasksWithSource(
      courseTasksWithSource.map(([courseTask, source], i) => {
        if (i === index) {
          return [
            {
              name: courseTaskEdit.name ?? courseTask.name,
              coursePartId: coursePartId!,
              daysValid:
                courseTaskEdit.daysValid !== undefined
                  ? courseTaskEdit.daysValid
                  : courseTask.daysValid,
              maxGrade:
                courseTaskEdit.maxGrade !== undefined
                  ? courseTaskEdit.maxGrade
                  : courseTask.maxGrade,
            },
            source,
          ];
        }
        return [courseTask, source];
      })
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const sources: NewAplusGradeSourceData[] = [];
    for (const [courseTask, source] of courseTasksWithSource) {
      sources.push({
        ...source,
        courseTaskId: await addCourseTask.mutateAsync(courseTask),
      });
    }

    await addAplusGradeSources.mutateAsync(sources);
  };

  return (
    <>
      <AplusTokenDialog
        handleClose={onClose}
        handleSubmit={() => {
          setAplusTokenDialogOpen(false);
          aplusCourses.refetch();
        }}
        open={open && aplusTokenDialogOpen}
        error={aplusCourses.isError}
      />
      <Dialog
        open={open && !aplusTokenDialogOpen}
        onClose={handleResetAndClose}
        maxWidth="md"
        fullWidth
      >
        {step === 0 && <DialogTitle>{t('general.a+-courses')}</DialogTitle>}
        {step === 1 && (
          <DialogTitle>{t('course.parts.select-grade-sources')}</DialogTitle>
        )}
        {step === 2 && (
          <DialogTitle>{t('course.parts.create-tasks')}</DialogTitle>
        )}
        <DialogContent>
          {step === 0 && aplusCourses.data !== undefined && (
            <SelectAplusCourse
              aplusCourses={aplusCourses.data}
              selectedAplusCourse={aplusCourse}
              setAplusCourse={course => {
                setAplusCourse(course);
                if (course) setCourseTasksWithSource([]);
              }}
            />
          )}
          {step === 1 && aplusCourse !== null && (
            <SelectAplusGradeSources
              aplusCourse={aplusCourse}
              selectedGradeSources={courseTasksWithSource.map(([_, s]) => s)}
              handleChange={handleSelectionChange}
            />
          )}
          {step === 2 && aplusCourse !== null && (
            <CreateAplusCourseTasks
              courseTasksWithSource={courseTasksWithSource}
              handleChange={handleCourseTaskChange}
            />
          )}
        </DialogContent>
        <DialogActions>
          {step > 0 && (
            <Button onClick={() => setStep(step - 1)} sx={{mr: 'auto'}}>
              {t('general.back')}
            </Button>
          )}
          {step <= 1 && (
            <Button
              disabled={
                step === 0 ? !aplusCourse : courseTasksWithSource.length === 0
              }
              onClick={() => setStep(step + 1)}
            >
              {t('general.next')}
            </Button>
          )}
          {step === 2 && (
            <Button
              onClick={async () => {
                await handleSubmit();
                handleResetAndClose();
              }}
            >
              {t('general.submit')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewAplusCourseTasksDialog;
