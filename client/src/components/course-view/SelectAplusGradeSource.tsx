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
  NewAplusGradeSourceData,
  AplusGradeSourceType,
} from '@/common/types';
import {useFetchAplusExerciseData} from '../../hooks/useApi';

type PropsType = {
  aplusCourse: AplusCourseData;
  handleSelect: (source: NewAplusGradeSourceData) => void;
};

const SelectAplusGradeSource = ({
  aplusCourse,
  handleSelect,
}: PropsType): JSX.Element => {
  const aplusExerciseData = useFetchAplusExerciseData(aplusCourse.id);

  if (aplusExerciseData.data === undefined) return <></>;

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          Course
        </AccordionSummary>
        <AccordionDetails>
          <Button
            onClick={() =>
              handleSelect({
                coursePartId: -1,
                aplusCourse: aplusCourse,
                sourceType: AplusGradeSourceType.FullPoints,
              })
            }
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
                onClick={() =>
                  handleSelect({
                    coursePartId: -1,
                    aplusCourse: aplusCourse,
                    sourceType: AplusGradeSourceType.Module,
                    moduleId: module.id,
                    moduleName: module.name,
                  })
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
                  onClick={() =>
                    handleSelect({
                      coursePartId: -1,
                      aplusCourse: aplusCourse,
                      sourceType: AplusGradeSourceType.Exercise,
                      exerciseId: exercise.id,
                      exerciseName: exercise.name,
                    })
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
                  onClick={() =>
                    handleSelect({
                      coursePartId: -1,
                      aplusCourse: aplusCourse,
                      sourceType: AplusGradeSourceType.Difficulty,
                      difficulty: difficulty,
                    })
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
