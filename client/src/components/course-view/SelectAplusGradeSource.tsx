// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  FormGroup,
} from '@mui/material';
import {JSX} from 'react';

import {
  AplusCourseData,
  AplusGradeSourceData,
  NewAplusGradeSourceData,
} from '@/common/types';
import {aplusGradeSourcesEqual} from '@/common/util/aplus';
import {useFetchAplusExerciseData} from '../../hooks/useApi';
import {newAplusGradeSource} from '../../utils/utils';

type PropsType = {
  aplusCourse: AplusCourseData;
  aplusGradeSources: AplusGradeSourceData[];
  handleSelect: (source: NewAplusGradeSourceData) => void;
};

const SelectAplusGradeSource = ({
  aplusCourse,
  aplusGradeSources,
  handleSelect,
}: PropsType): JSX.Element => {
  const aplusExerciseData = useFetchAplusExerciseData(aplusCourse.id);

  const isDisabled = (newSource: NewAplusGradeSourceData): boolean => {
    for (const source of aplusGradeSources) {
      if (aplusGradeSourcesEqual(newSource, source)) {
        return true;
      }
    }
    return false;
  };

  if (aplusExerciseData.data === undefined) return <></>;

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          Course
        </AccordionSummary>
        <AccordionDetails>
          <Button
            disabled={isDisabled(newAplusGradeSource(aplusCourse, {}))}
            onClick={() => handleSelect(newAplusGradeSource(aplusCourse, {}))}
          >
            Full points
          </Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          Modules
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {aplusExerciseData.data.modules.map(module => (
              <Button
                disabled={isDisabled(
                  newAplusGradeSource(aplusCourse, {module})
                )}
                onClick={() =>
                  handleSelect(newAplusGradeSource(aplusCourse, {module}))
                }
              >
                {module.name}
              </Button>
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          Exercises
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {aplusExerciseData.data.modules.map(module =>
              module.exercises.map(exercise => (
                <Button
                  disabled={isDisabled(
                    newAplusGradeSource(aplusCourse, {exercise})
                  )}
                  onClick={() =>
                    handleSelect(newAplusGradeSource(aplusCourse, {exercise}))
                  }
                >
                  {exercise.name}
                </Button>
              ))
            )}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      {aplusExerciseData.data.difficulties.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ArrowDropDown />}>
            Difficulties
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {aplusExerciseData.data.difficulties.map(difficulty => (
                <Button
                  disabled={isDisabled(
                    newAplusGradeSource(aplusCourse, {difficulty})
                  )}
                  onClick={() =>
                    handleSelect(newAplusGradeSource(aplusCourse, {difficulty}))
                  }
                >
                  {difficulty}
                </Button>
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};

export default SelectAplusGradeSource;
