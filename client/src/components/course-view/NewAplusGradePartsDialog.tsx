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
import {JSX, useState} from 'react';
import {useParams} from 'react-router-dom';

import {
  AplusCourseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
} from '@/common/types';
import CreateAplusCourseParts from './CreateAplusCourseParts';
import SelectAplusCourse from './SelectAplusCourse';
import SelectAplusGradeSources from './SelectAplusGradeSources';
import {
  useAddAplusGradeSources,
  useAddCoursePart,
  useFetchAplusCourses,
} from '../../hooks/useApi';

import Type = AplusGradeSourceType;

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

// TODO: Better state handling between different stages
const NewAplusCoursePartsDialog = ({
  handleClose,
  open,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const aplusCourses = useFetchAplusCourses();
  const addCoursePart = useAddCoursePart(courseId);
  const addAplusGradeSources = useAddAplusGradeSources(courseId);

  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const [CoursePartsWithSource, setCoursePartsWithSource] = useState<
    [{name: string; daysValid: number}, AplusGradeSourceData][]
  >([]);

  const handleResetAndClose = (): void => {
    setStep(0);
    setAplusCourse(null);
    setCoursePartsWithSource([]);
    handleClose();
  };

  const handleSelectionChange = (
    checked: boolean,
    name: string,
    source: AplusGradeSourceData
  ): void => {
    if (checked) {
      setCoursePartsWithSource([
        ...CoursePartsWithSource,
        [{name: name, daysValid: 365}, source],
      ]);
    } else {
      setCoursePartsWithSource(
        CoursePartsWithSource.filter(([_, s]) => {
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
    coursePart: {name?: string; daysValid?: number}
  ): void => {
    setCoursePartsWithSource(
      CoursePartsWithSource.map(([a, s], i) => {
        if (i === index) {
          return [
            {
              name: coursePart.name ?? a.name,
              daysValid: coursePart.daysValid ?? a.daysValid,
            },
            s,
          ];
        }
        return [a, s];
      })
    );
  };

  const handleSubmit = async (): Promise<void> => {
    const sources: AplusGradeSourceData[] = [];
    for (const [coursePart, source] of CoursePartsWithSource) {
      sources.push({
        ...source,
        coursePartId: await addCoursePart.mutateAsync(coursePart),
      });
    }

    await addAplusGradeSources.mutateAsync(sources);
  };

  return (
    <Dialog open={open} onClose={handleResetAndClose}>
      <DialogTitle>A+ Courses</DialogTitle>
      <DialogContent>
        {step === 0 && aplusCourses.data && (
          <SelectAplusCourse
            aplusCourses={aplusCourses.data}
            setAplusCourse={setAplusCourse}
          />
        )}
        {step === 1 && aplusCourse && (
          <SelectAplusGradeSources
            aplusCourse={aplusCourse}
            handleChange={handleSelectionChange}
          />
        )}
        {step === 2 && aplusCourse && (
          <CreateAplusCourseParts
            coursePartsWithSource={CoursePartsWithSource}
            handleChange={handleCoursePartChange}
          />
        )}
      </DialogContent>
      <DialogActions>
        {step > 0 && (
          <Button onClick={() => setStep(step - 1)} sx={{mr: 'auto'}}>
            Back
          </Button>
        )}
        {step <= 1 && (
          <Button disabled={!aplusCourse} onClick={() => setStep(step + 1)}>
            Next
          </Button>
        )}
        {step === 2 && (
          <Button
            onClick={async () => {
              await handleSubmit();
              handleResetAndClose();
            }}
          >
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default NewAplusCoursePartsDialog;