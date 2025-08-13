// SPDX-FileCopyrightText: 2024 The Ossi Developers
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

import type {
  AplusCourseData,
  AplusDifficulty,
  AplusExercise,
  AplusModule,
  NewAplusGradeSourceData,
} from '@/common/types';
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

  const fullPoints = newAplusGradeSource(
    aplusCourse,
    getLatestAplusModuleDate(aplusExerciseData.data),
    {}
  );
  const modules: [AplusModule, NewAplusGradeSourceData][] =
    aplusExerciseData.data.modules.map(module => [
      module,
      newAplusGradeSource(aplusCourse, module.closingDate, {module}),
    ]);
  const exercises: [AplusExercise, NewAplusGradeSourceData][] = [];
  for (const module of aplusExerciseData.data.modules) {
    for (const exercise of module.exercises) {
      exercises.push([
        exercise,
        newAplusGradeSource(aplusCourse, module.closingDate, {exercise}),
      ]);
    }
  }
  const difficulties: [AplusDifficulty, NewAplusGradeSourceData][] =
    aplusExerciseData.data.difficulties.map(difficulty => [
      difficulty,
      newAplusGradeSource(
        aplusCourse,
        getLatestAplusModuleDate(aplusExerciseData.data),
        {difficulty}
      ),
    ]);

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.course')}
        </AccordionSummary>
        <AccordionDetails>
          <FormControlLabel
            label={t('general.full-points')}
            control={(
              <Checkbox
                checked={isChecked(fullPoints)}
                onChange={e =>
                  handleChange(
                    e.target.checked,
                    `[${aplusCourse.name}] ${t('general.full-points')}`,
                    aplusExerciseData.data.maxGrade,
                    fullPoints
                  )}
              />
            )}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.modules')}
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {modules.map(([module, moduleSource]) => (
              <FormControlLabel
                key={module.id}
                label={module.name}
                control={(
                  <Checkbox
                    checked={isChecked(moduleSource)}
                    onChange={e =>
                      handleChange(
                        e.target.checked,
                        `[${aplusCourse.name}] ${t('general.module')}: ${module.name}`,
                        module.maxGrade,
                        moduleSource
                      )}
                  />
                )}
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
            {exercises.map(([exercise, exerciseSource]) => (
              <FormControlLabel
                key={exercise.id}
                label={exercise.name}
                control={(
                  <Checkbox
                    checked={isChecked(exerciseSource)}
                    onChange={e =>
                      handleChange(
                        e.target.checked,
                        `[${aplusCourse.name}] ${t('general.exercise')}: ${exercise.name}`,
                        exercise.maxGrade,
                        exerciseSource
                      )}
                  />
                )}
              />
            ))}
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      {difficulties.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ArrowDropDown />}>
            {t('general.difficulties')}
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {difficulties.map(([difficulty, difficultySource]) => (
                <FormControlLabel
                  key={difficulty.difficulty}
                  label={difficulty.difficulty}
                  control={(
                    <Checkbox
                      checked={isChecked(difficultySource)}
                      onChange={e =>
                        handleChange(
                          e.target.checked,
                          `[${aplusCourse.name}] ${t('general.difficulty')}: ${difficulty.difficulty}`,
                          difficulty.maxGrade,
                          difficultySource
                        )}
                    />
                  )}
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
