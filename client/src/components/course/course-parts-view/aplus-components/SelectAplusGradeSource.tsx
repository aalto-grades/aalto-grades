// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {ArrowDropDown} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
} from '@mui/material';
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {
  AplusCourseData,
  AplusDifficulty,
  AplusExercise,
  AplusGradeSourceData,
  AplusModule,
  NewAplusGradeSourceData,
} from '@/common/types';
import {aplusGradeSourcesEqual} from '@/common/util';
import {useFetchAplusExerciseData} from '@/hooks/useApi';
import {getLatestAplusModuleDate, newAplusGradeSource} from '@/utils';

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
  const {t} = useTranslation();
  const aplusExerciseData = useFetchAplusExerciseData(aplusCourse.id);

  const isDisabled = (newSource: NewAplusGradeSourceData): boolean =>
    aplusGradeSources.some(gradeSource =>
      aplusGradeSourcesEqual(newSource, gradeSource)
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
      {/* Full points */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.course')}
        </AccordionSummary>
        <AccordionDetails>
          <Button
            fullWidth
            disabled={isDisabled(fullPoints)}
            onClick={() => handleSelect(fullPoints)}
            sx={{justifyContent: 'flex-start'}}
          >
            {t('general.full-points')}
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Modules */}
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.modules')}
        </AccordionSummary>
        <AccordionDetails>
          {modules.map(([module, moduleSource]) => (
            <Button
              key={module.id}
              fullWidth
              disabled={isDisabled(moduleSource)}
              onClick={() => handleSelect(moduleSource)}
              sx={{justifyContent: 'flex-start'}}
            >
              {module.name}
            </Button>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Exercises */}
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.exercises')}
        </AccordionSummary>
        <AccordionDetails>
          {exercises.map(([exercise, exerciseSource]) => (
            <Button
              key={exercise.id}
              fullWidth
              disabled={isDisabled(exerciseSource)}
              onClick={() => handleSelect(exerciseSource)}
              sx={{justifyContent: 'flex-start'}}
            >
              {exercise.name}
            </Button>
          ))}
        </AccordionDetails>
      </Accordion>

      {/* Difficulties */}
      {difficulties.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ArrowDropDown />}>
            {t('general.difficulties')}
          </AccordionSummary>
          <AccordionDetails>
            {difficulties.map(([difficulty, difficultySource]) => (
              <Button
                key={difficulty.difficulty}
                fullWidth
                disabled={isDisabled(difficultySource)}
                onClick={() => handleSelect(difficultySource)}
                sx={{justifyContent: 'flex-start'}}
              >
                {difficulty.difficulty}
              </Button>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};

export default SelectAplusGradeSource;
