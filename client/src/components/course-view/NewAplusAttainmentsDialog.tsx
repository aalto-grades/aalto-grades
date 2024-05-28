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
import {useParams} from 'react-router-dom';

import {
  AplusCourseData,
  AplusGradeSourceData,
  AplusGradeSourceType,
} from '@/common/types';
import CreateAplusAttainments from './CreateAplusAttainments';
import SelectAplusCourse from './SelectAplusCourse';
import SelectAplusGradeSources from './SelectAplusGradeSources';
import {
  useAddAplusGradeSources,
  useAddAttainment,
  useFetchAplusCourses,
} from '../../hooks/useApi';

import Type = AplusGradeSourceType;

type PropsType = {
  handleClose: () => void;
  open: boolean;
};

// TODO: Better state handling between different stages
const NewAplusAttainmentsDialog = ({
  handleClose,
  open,
}: PropsType): JSX.Element => {
  const {courseId} = useParams() as {courseId: string};
  const aplusCourses = useFetchAplusCourses();
  const addAttainment = useAddAttainment(courseId);
  const addAplusGradeSources = useAddAplusGradeSources(courseId);

  const [step, setStep] = useState<number>(0);
  const [aplusCourse, setAplusCourse] = useState<AplusCourseData | null>(null);

  const [attainmentsWithSource, setAttainmentsWithSource] = useState<
    [{name: string; daysValid: number}, AplusGradeSourceData][]
  >([]);

  const handleResetAndClose = (): void => {
    setStep(0);
    setAplusCourse(null);
    setAttainmentsWithSource([]);
    handleClose();
  };

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

  const handleSubmit = async (): Promise<void> => {
    const sources: AplusGradeSourceData[] = [];
    for (const [attainment, source] of attainmentsWithSource) {
      sources.push({
        ...source,
        attainmentId: await addAttainment.mutateAsync(attainment),
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
          <CreateAplusAttainments
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

export default NewAplusAttainmentsDialog;
