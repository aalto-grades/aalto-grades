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
  NewAplusGradeSourceData,
  AplusGradeSourceType,
} from '@/common/types';
import CreateAplusCourseParts from './CreateAplusCourseParts';
import SelectAplusCourse from './SelectAplusCourse';
import SelectAplusGradeSources from './SelectAplusGradeSources';
import {
  useAddAplusGradeSources,
  useAddCoursePart,
  useFetchAplusCourses,
} from '../../../hooks/useApi';
import {getAplusToken} from '../../../utils/utils';
import AplusTokenDialog from '../../shared/AplusTokenDialog';

import Type = AplusGradeSourceType;

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

const NewAplusCoursePartsDialog = ({
  handleClose,
  open,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
  const {courseId} = useParams() as {courseId: string};
  const aplusCourses = useFetchAplusCourses({
    enabled: Boolean(getAplusToken()),
  });
  const addCoursePart = useAddCoursePart(courseId);
  const addAplusGradeSources = useAddAplusGradeSources(courseId);

  const [aplusTokenDialogOpen, setAplusTokenDialogOpen] =
    useState<boolean>(false);
  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const [coursePartsWithSource, setCoursePartsWithSource] = useState<
    [
      {name: string; daysValid: number; maxGrade: number},
      NewAplusGradeSourceData,
    ][]
  >([]);

  useEffect(() => {
    setAplusTokenDialogOpen(!getAplusToken() || aplusCourses.isError);
  }, [open, aplusCourses]);

  const handleResetAndClose = (): void => {
    setStep(0);
    setAplusCourse(null);
    setCoursePartsWithSource([]);
    handleClose();
  };

  const handleSelectionChange = (
    checked: boolean,
    name: string,
    maxGrade: number,
    source: NewAplusGradeSourceData
  ): void => {
    if (checked) {
      setCoursePartsWithSource([
        ...coursePartsWithSource,
        [{name: name, daysValid: 365, maxGrade: maxGrade}, source],
      ]);
    } else {
      setCoursePartsWithSource(
        coursePartsWithSource.filter(([_, s]) => {
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

  const handleCoursePartChange = (
    index: number,
    coursePartEdit: {
      name?: string;
      daysValid?: number;
      maxGrade?: number;
    }
  ): void => {
    setCoursePartsWithSource(
      coursePartsWithSource.map(([coursePart, source], i) => {
        if (i === index) {
          return [
            {
              name: coursePartEdit.name ?? coursePart.name,
              daysValid: coursePartEdit.daysValid ?? coursePart.daysValid,
              maxGrade:
                coursePartEdit.maxGrade !== undefined
                  ? coursePartEdit.maxGrade
                  : coursePart.maxGrade,
            },
            source,
          ];
        }
        return [coursePart, source];
      })
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const sources: NewAplusGradeSourceData[] = [];
    for (const [coursePart, source] of coursePartsWithSource) {
      sources.push({
        ...source,
        coursePartId: await addCoursePart.mutateAsync(coursePart),
      });
    }

    await addAplusGradeSources.mutateAsync(sources);
  };

  return (
    <>
      <Dialog open={open} onClose={handleResetAndClose} maxWidth="md">
        {step === 0 && <DialogTitle>{t('general.a+-courses')}</DialogTitle>}
        {step === 1 && (
          <DialogTitle>{t('course.a+.select-grade-source.plural')}</DialogTitle>
        )}
        {step === 2 && <DialogTitle>{t('course.a+.create-parts')}</DialogTitle>}
        <DialogContent>
          {step === 0 && aplusCourses.data && (
            <SelectAplusCourse
              aplusCourses={aplusCourses.data}
              selectedAplusCourse={aplusCourse}
              setAplusCourse={(course: AplusCourseData | null) => {
                setAplusCourse(course);
                if (course) setCoursePartsWithSource([]);
              }}
            />
          )}
          {step === 1 && aplusCourse && (
            <SelectAplusGradeSources
              aplusCourse={aplusCourse}
              selectedGradeSources={coursePartsWithSource.map(([_, s]) => s)}
              handleChange={handleSelectionChange}
            />
          )}
          {step === 2 && aplusCourse && (
            <CreateAplusCourseParts
              coursePartsWithSource={coursePartsWithSource}
              handleChange={handleCoursePartChange}
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
                step === 0 ? !aplusCourse : coursePartsWithSource.length === 0
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
        handleClose={handleClose}
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
