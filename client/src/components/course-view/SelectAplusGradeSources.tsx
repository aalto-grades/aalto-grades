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

import {AplusCourseData, NewAplusGradeSourceData} from '@/common/types';
import {aplusGradeSourcesEqual} from '@/common/util/aplus';
import {useFetchAplusExerciseData} from '../../hooks/useApi';
import {getLatestAplusModuleDate, newAplusGradeSource} from '../../utils/utils';

type PropsType = {
  aplusCourse: AplusCourseData;
  selectedGradeSources: NewAplusGradeSourceData[];
  handleChange: (
    checked: boolean,
    name: string,
    source: NewAplusGradeSourceData
  ) => void;
};

const SelectAplusGradeSources = ({
  aplusCourse,
  selectedGradeSources,
  handleChange,
}: PropsType): JSX.Element => {
  const aplusExerciseData = useFetchAplusExerciseData(aplusCourse.id);

  const isChecked = (newSource: NewAplusGradeSourceData): boolean => {
    for (const source of selectedGradeSources) {
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
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked={isChecked(
                  newAplusGradeSource(
                    aplusCourse,
                    getLatestAplusModuleDate(aplusExerciseData.data),
                    {}
                  )
                )}
                onChange={e =>
                  handleChange(
                    e.target.checked,
                    `A+ Course: ${aplusCourse.name}`,
                    newAplusGradeSource(
                      aplusCourse,
                      getLatestAplusModuleDate(aplusExerciseData.data),
                      {}
                    )
                  )
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
                    defaultChecked={isChecked(
                      newAplusGradeSource(aplusCourse, module.closingDate, {
                        module,
                      })
                    )}
                    onChange={e =>
                      handleChange(
                        e.target.checked,
                        `A+ Module: ${module.name}`,
                        newAplusGradeSource(aplusCourse, module.closingDate, {
                          module,
                        })
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
                      defaultChecked={isChecked(
                        newAplusGradeSource(aplusCourse, module.closingDate, {
                          exercise,
                        })
                      )}
                      onChange={e =>
                        handleChange(
                          e.target.checked,
                          `A+ Exercise: ${exercise.name}`,
                          newAplusGradeSource(aplusCourse, module.closingDate, {
                            exercise,
                          })
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
                      defaultChecked={isChecked(
                        newAplusGradeSource(
                          aplusCourse,
                          getLatestAplusModuleDate(aplusExerciseData.data),
                          {difficulty}
                        )
                      )}
                      onChange={e =>
                        handleChange(
                          e.target.checked,
                          `A+ Difficulty: ${difficulty}`,
                          newAplusGradeSource(
                            aplusCourse,
                            getLatestAplusModuleDate(aplusExerciseData.data),
                            {difficulty}
                          )
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
