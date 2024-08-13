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
import {useTranslation} from 'react-i18next';

import {AplusCourseData, NewAplusGradeSourceData} from '@/common/types';
import {aplusGradeSourcesEqual} from '@/common/util/aplus';
import {useFetchAplusExerciseData} from '@/hooks/useApi';
import {getLatestAplusModuleDate, newAplusGradeSource} from '@/utils/utils';

type PropsType = {
  aplusCourse: AplusCourseData;
  selectedGradeSources: NewAplusGradeSourceData[];
  handleChange: (
    checked: boolean,
    name: string,
    maxGrade: number,
    source: NewAplusGradeSourceData
  ) => void;
};

const SelectAplusGradeSources = ({
  aplusCourse,
  selectedGradeSources,
  handleChange,
}: PropsType): JSX.Element => {
  const {t} = useTranslation();
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
          {t('general.course')}
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
                    `A+ ${t('general.course')}: ${aplusCourse.name}`,
                    aplusExerciseData.data.maxGrade,
                    newAplusGradeSource(
                      aplusCourse,
                      getLatestAplusModuleDate(aplusExerciseData.data),
                      {}
                    )
                  )
                }
              />
            }
            label={t('general.full-points')}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.modules')}
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
                        `A+ ${t('general.module')}: ${module.name}`,
                        module.maxGrade,
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
          {t('general.exercises')}
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
                          `A+ ${t('general.exercise')}: ${exercise.name}`,
                          exercise.maxGrade,
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
            {t('general.difficulties')}
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
                          `A+ ${t('general.difficulty')}: ${difficulty.difficulty}`,
                          difficulty.maxGrade,
                          newAplusGradeSource(
                            aplusCourse,
                            getLatestAplusModuleDate(aplusExerciseData.data),
                            {difficulty}
                          )
                        )
                      }
                    />
                  }
                  label={difficulty.difficulty}
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
