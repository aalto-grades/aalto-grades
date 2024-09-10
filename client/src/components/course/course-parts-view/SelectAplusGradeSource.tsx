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
import type {JSX} from 'react';
import {useTranslation} from 'react-i18next';

import type {
  AplusCourseData,
  AplusGradeSourceData,
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

  const isDisabled = (newSource: NewAplusGradeSourceData): boolean => {
    for (const source of aplusGradeSources) {
      if (aplusGradeSourcesEqual(newSource, source)) {
        return true;
      }
    }
    return false;
  };

  if (aplusExerciseData.data === undefined) return <>{t('general.loading')}</>;

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.course')}
        </AccordionSummary>
        <AccordionDetails>
          <Button
            disabled={isDisabled(
              newAplusGradeSource(
                aplusCourse,
                getLatestAplusModuleDate(aplusExerciseData.data),
                {}
              )
            )}
            onClick={() =>
              handleSelect(
                newAplusGradeSource(
                  aplusCourse,
                  getLatestAplusModuleDate(aplusExerciseData.data),
                  {}
                )
              )
            }
          >
            {t('general.full-points')}
          </Button>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ArrowDropDown />}>
          {t('general.modules')}
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {aplusExerciseData.data.modules.map(module => (
              <Button
                key={module.id}
                disabled={isDisabled(
                  newAplusGradeSource(aplusCourse, module.closingDate, {module})
                )}
                onClick={() =>
                  handleSelect(
                    newAplusGradeSource(aplusCourse, module.closingDate, {
                      module,
                    })
                  )
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
          {t('general.exercises')}
        </AccordionSummary>
        <AccordionDetails>
          <FormGroup>
            {aplusExerciseData.data.modules.map(module =>
              module.exercises.map(exercise => (
                <Button
                  key={exercise.id}
                  disabled={isDisabled(
                    newAplusGradeSource(aplusCourse, module.closingDate, {
                      exercise,
                    })
                  )}
                  onClick={() =>
                    handleSelect(
                      newAplusGradeSource(aplusCourse, module.closingDate, {
                        exercise,
                      })
                    )
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
            {t('general.difficulties')}
          </AccordionSummary>
          <AccordionDetails>
            <FormGroup>
              {aplusExerciseData.data.difficulties.map(difficulty => (
                <Button
                  key={difficulty.difficulty}
                  disabled={isDisabled(
                    newAplusGradeSource(
                      aplusCourse,
                      getLatestAplusModuleDate(aplusExerciseData.data),
                      {difficulty}
                    )
                  )}
                  onClick={() =>
                    handleSelect(
                      newAplusGradeSource(
                        aplusCourse,
                        getLatestAplusModuleDate(aplusExerciseData.data),
                        {difficulty}
                      )
                    )
                  }
                >
                  {difficulty.difficulty}
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
