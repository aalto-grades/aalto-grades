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
import TokenDialog from '@/components/shared/auth/TokenDialog';
import {
  useAddAplusGradeSources,
  useFetchAplusCourses,
  useModifyCourseTasks,
} from '@/hooks/useApi';
import {getToken} from '@/utils';
import CreateAplusCourseTasks from './aplus-components/CreateAplusCourseTasks';
import SelectAplusCourse from './aplus-components/SelectAplusCourse';
import SelectAplusGradeSources from './aplus-components/SelectAplusGradeSources';

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
    enabled: Boolean(getToken('a+')),
  });
  const modifyCourseTasks = useModifyCourseTasks(courseId);
  const addAplusGradeSources = useAddAplusGradeSources(courseId);

  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const [newTasks, setNewTasks] = useState<
    [NewCourseTaskData, NewAplusGradeSourceData][]
  >([]);

  useEffect(() => {
    setAplusTokenDialogOpen(!getToken('a+') || aplusCourses.isError);
  }, [open, aplusCourses]);

  const handleResetAndClose = (): void => {
    setStep(0);
    setAplusCourse(null);
    setNewTasks([]);
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
      setNewTasks(oldTasks => [
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
      setNewTasks(oldTasks =>
        oldTasks.filter(
          ([_, oldSource]) => !aplusGradeSourcesEqual(oldSource, source)
        )
      );
    }
  };

  const handleCourseTaskChange = (
    index: number,
    courseTaskEdit: Omit<EditCourseTaskData, 'id'>
  ): void => {
    setNewTasks(
      newTasks.map(([courseTask, source], i) => {
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
    const courseTasks = newTasks.map(([courseTask]) => courseTask);
    const sources = newTasks.map(([, source]) => source);

    const newIds = await modifyCourseTasks.mutateAsync({add: courseTasks});
    const newSources = newIds.map((courseTaskId, i) => ({
      ...sources[i],
      courseTaskId,
    }));

    await addAplusGradeSources.mutateAsync(newSources);
  };

  return (
    <>
      <TokenDialog
        open={open && aplusTokenDialogOpen}
        onClose={onClose}
        onSubmit={() => {
          setAplusTokenDialogOpen(false);
          aplusCourses.refetch();
        }}
        tokenType="a+"
        error={aplusCourses.isError}
      />
      <Dialog
        open={open && !aplusTokenDialogOpen}
        onClose={handleResetAndClose}
        maxWidth="md"
        fullWidth
      >
        {step === 0 && (
          <>
            <DialogTitle>{t('general.a+-courses')}</DialogTitle>
            <DialogContent>
              {aplusCourses.data !== undefined && (
                <SelectAplusCourse
                  aplusCourses={aplusCourses.data}
                  selectedAplusCourse={aplusCourse}
                  setAplusCourse={course => {
                    setAplusCourse(course);
                    if (course) setNewTasks([]);
                  }}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button disabled={!aplusCourse} onClick={() => setStep(step + 1)}>
                {t('general.next')}
              </Button>
            </DialogActions>
          </>
        )}

        {step === 1 && (
          <>
            <DialogTitle>{t('course.parts.select-grade-sources')}</DialogTitle>
            <DialogContent>
              {aplusCourse !== null && (
                <SelectAplusGradeSources
                  aplusCourse={aplusCourse}
                  selectedGradeSources={newTasks.map(([_, s]) => s)}
                  handleChange={handleSelectionChange}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStep(step - 1)} sx={{mr: 'auto'}}>
                {t('general.back')}
              </Button>
              <Button
                disabled={newTasks.length === 0}
                onClick={() => setStep(step + 1)}
              >
                {t('general.next')}
              </Button>
            </DialogActions>
          </>
        )}

        {step === 2 && (
          <>
            <DialogTitle>{t('course.parts.create-tasks')}</DialogTitle>
            <DialogContent>
              {aplusCourse !== null && (
                <CreateAplusCourseTasks
                  courseTasksWithSource={newTasks}
                  handleChange={handleCourseTaskChange}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setStep(step - 1)} sx={{mr: 'auto'}}>
                {t('general.back')}
              </Button>
              <Button
                onClick={async () => {
                  await handleSubmit();
                  handleResetAndClose();
                }}
              >
                {t('general.submit')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default NewAplusCourseTasksDialog;
