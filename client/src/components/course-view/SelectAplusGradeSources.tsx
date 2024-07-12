// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import {JSX} from 'react';

import {
  AplusCourseData,
  NewAplusGradeSourceData,
  AplusGradeSourceType,
} from '@/common/types';
import {useFetchAplusExerciseData} from '../../hooks/useApi';
import {getLatestAplusModuleDate} from '../../utils/utils';

type PropsType = {
  aplusCourse: AplusCourseData;
  handleChange: (
    checked: boolean,
    name: string,
    source: NewAplusGradeSourceData
  ) => void;
};

const SelectAplusGradeSources = ({
  aplusCourse,
  handleChange,
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
          <FormControlLabel
            control={
              <Checkbox
                onChange={e =>
                  handleChange(e.target.checked, 'A+ Course', {
                    coursePartId: -1,
                    aplusCourse: aplusCourse,
                    sourceType: AplusGradeSourceType.FullPoints,
                    date: getLatestAplusModuleDate(aplusExerciseData.data),
                  })
                }
              />
            }
            label="Full points"
          />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          Modules
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {aplusExerciseData.data.modules.map(module => (
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={e =>
                      handleChange(
                        e.target.checked,
                        `A+ Module: ${module.name}`,
                        {
                          coursePartId: -1,
                          aplusCourse: aplusCourse,
                          sourceType: AplusGradeSourceType.Module,
                          moduleId: module.id,
                          moduleName: module.name,
                          date: module.closingDate,
                        }
                      )
                    }
                  />
                }
                label={module.name}
              />
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
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={e =>
                        handleChange(
                          e.target.checked,
                          `A+ Exercise: ${exercise.name}`,
                          {
                            coursePartId: -1,
                            aplusCourse: aplusCourse,
                            sourceType: AplusGradeSourceType.Exercise,
                            exerciseId: exercise.id,
                            exerciseName: exercise.name,
                            date: module.closingDate,
                          }
                        )
                      }
                    />
                  }
                  label={exercise.name}
                />
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
                <FormControlLabel
                  control={
                    <Checkbox
                      onChange={e =>
                        handleChange(
                          e.target.checked,
                          `A+ Difficulty: ${difficulty}`,
                          {
                            coursePartId: -1,
                            aplusCourse: aplusCourse,
                            sourceType: AplusGradeSourceType.Difficulty,
                            difficulty: difficulty,
                            date: getLatestAplusModuleDate(
                              aplusExerciseData.data
                            ),
                          }
                        )
                      }
                    />
                  }
                  label={difficulty}
                />
              ))}
            </FormGroup>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};

export default SelectAplusGradeSources;
