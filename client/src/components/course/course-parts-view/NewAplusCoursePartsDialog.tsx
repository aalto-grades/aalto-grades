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
import {JSX, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import {
  AplusCourseData,
  AplusGradeSourceType,
  EditCourseTaskData,
  NewAplusGradeSourceData,
  NewCourseTaskData,
} from '@/common/types';
import AplusTokenDialog from '@/components/shared/auth/AplusTokenDialog';
import {useAddCourseTask} from '@/hooks/api/courseTask';
import {useAddAplusGradeSources, useFetchAplusCourses} from '@/hooks/useApi';
import {getAplusToken} from '@/utils/utils';
import CreateAplusCourseParts from './CreateAplusCourseParts';
import SelectAplusCourse from './SelectAplusCourse';
import SelectAplusGradeSources from './SelectAplusGradeSources';

import Type = AplusGradeSourceType;

type PropsType = {
  open: boolean;
  onClose: () => void;
  coursePartId: number | null;
};

const NewAplusCoursePartsDialog = ({
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
      setCourseTasksWithSource(oldTasks =>
        oldTasks.concat([
          {
            name: name,
            coursePartId: coursePartId!,
            daysValid: null,
            maxGrade: maxGrade,
          },
          source,
        ])
      );
    } else {
      setCourseTasksWithSource(oldTasks =>
        oldTasks.filter(([_, s]) => {
          // Type.Exercise missing?
          if (s.sourceType === Type.Module && source.sourceType === Type.Module)
            return s.moduleId !== source.moduleId;

          if (
            s.sourceType === Type.Difficulty &&
            source.sourceType === Type.Difficulty
          )
            return s.difficulty !== source.difficulty;

          return !(
            s.sourceType === Type.FullPoints &&
            source.sourceType === Type.FullPoints
          );
        })
      );
    }
  };

  const handleCourseTaskChange = (
    index: number,
    coursePartEdit: EditCourseTaskData
  ): void => {
    setCourseTasksWithSource(
      courseTasksWithSource.map(([courseTask, source], i) => {
        if (i === index) {
          return [
            {
              name: coursePartEdit.name ?? courseTask.name,
              coursePartId: coursePartId!,
              daysValid:
                coursePartEdit.daysValid !== undefined
                  ? coursePartEdit.daysValid
                  : courseTask.daysValid,
              maxGrade:
                coursePartEdit.maxGrade !== undefined
                  ? coursePartEdit.maxGrade
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
      <Dialog open={open} onClose={handleResetAndClose} maxWidth="md">
        {step === 0 && <DialogTitle>{t('general.a+-courses')}</DialogTitle>}
        {step === 1 && (
          <DialogTitle>{t('course.parts.select-grade-sources')}</DialogTitle>
        )}
        {step === 2 && (
          <DialogTitle>{t('course.parts.create-parts')}</DialogTitle>
        )}
        <DialogContent>
          {step === 0 && aplusCourses.data && (
            <SelectAplusCourse
              aplusCourses={aplusCourses.data}
              selectedAplusCourse={aplusCourse}
              setAplusCourse={course => {
                setAplusCourse(course);
                if (course) setCourseTasksWithSource([]);
              }}
            />
          )}
          {step === 1 && aplusCourse && (
            <SelectAplusGradeSources
              aplusCourse={aplusCourse}
              selectedGradeSources={courseTasksWithSource.map(([_, s]) => s)}
              handleChange={handleSelectionChange}
            />
          )}
          {step === 2 && aplusCourse && (
            <CreateAplusCourseParts
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
      <AplusTokenDialog
        handleClose={onClose}
        handleSubmit={() => {
          setAplusTokenDialogOpen(false);
          aplusCourses.refetch();
        }}
        open={aplusTokenDialogOpen && open}
        error={aplusCourses.isError}
      />
    </>
  );
};

export default NewAplusCoursePartsDialog;
