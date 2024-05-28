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
import {useState} from 'react';

import {
  AplusCourseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
} from '@/common/types';
import CreateAplusAttainments from './CreateAplusAttainments';
import SelectAplusGradeSources from './SelectAplusGradeSources';
import {useFetchAplusCourses} from '../../hooks/useApi';

import Type = AplusGradeSourceType;

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

const AplusDialog = ({handleClose, open}: PropsType): JSX.Element => {
  const aplusCourses = useFetchAplusCourses();

  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const [attainmentsWithSource, setAttainmentsWithSource] = useState<
    [{name: string; daysValid: number}, AplusGradeSourceData][]
  >([]);

  const handleSelectionChange = (
    checked: boolean,
    name: string,
    source: AplusGradeSourceData
  ): void => {
    if (checked) {
      setAttainmentsWithSource([
        ...attainmentsWithSource,
        [{name: name, daysValid: 365}, source],
      ]);
    } else {
      setAttainmentsWithSource(
        attainmentsWithSource.filter(([_, s]) => {
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

  const handleAttainmentChange = (
    index: number,
    attainment: {name?: string; daysValid?: number}
  ): void => {
    setAttainmentsWithSource(
      attainmentsWithSource.map(([a, s], i) => {
        if (i === index) {
          return [
            {
              name: attainment.name ?? a.name,
              daysValid: attainment.daysValid ?? a.daysValid,
            },
            s,
          ];
        }
        return [a, s];
      })
    );
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>A+ Courses</DialogTitle>
      <DialogContent>
        {step === 0 &&
          aplusCourses.data &&
          aplusCourses.data.map(course => (
            <Button
              onClick={() => {
                setAplusCourse(course);
                setStep(1);
              }}
            >
              {course.name}
            </Button>
          ))}
        {step === 1 && aplusCourse && (
          <SelectAplusGradeSources
            aplusCourse={aplusCourse}
            handleChange={handleSelectionChange}
          />
        )}
        {step === 2 && aplusCourse && (
          <CreateAplusAttainments
            aplusCourseId={aplusCourse.id}
            attainmentsWithSource={attainmentsWithSource}
            handleChange={handleAttainmentChange}
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
          <Button disabled={step === 0} onClick={() => setStep(step + 1)}>
            Next
          </Button>
        )}
        {step === 2 && <Button onClick={() => handleClose()}>Submit</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default AplusDialog;
