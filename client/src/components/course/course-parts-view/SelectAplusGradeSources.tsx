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
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {AplusCourseData, NewAplusGradeSourceData} from '@/common/types';
import {aplusGradeSourcesEqual} from '@/common/util';
import {useFetchAplusExerciseData} from '@/hooks/useApi';
import {getLatestAplusModuleDate, newAplusGradeSource} from '@/utils';

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

  const isChecked = (newSource: NewAplusGradeSourceData): boolean =>
    selectedGradeSources.some(source =>
      aplusGradeSourcesEqual(newSource, source)
    );

  if (aplusExerciseData.data === undefined) return <>{t('general.loading')}</>;

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.course')}
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            label={t('general.full-points')}
            control={
              <Checkbox
                checked={isChecked(
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
                key={module.id}
                label={module.name}
                control={
                  <Checkbox
                    checked={isChecked(
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
                  key={exercise.id}
                  label={exercise.name}
                  control={
                    <Checkbox
                      checked={isChecked(
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
                  key={difficulty.difficulty}
                  label={difficulty.difficulty}
                  control={
                    <Checkbox
                      checked={isChecked(
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
