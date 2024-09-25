// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type AplusGradeSourceData,
  AplusGradeSourceType,
  type AplusSourceDifficulty,
  type AplusSourceExercise,
  type AplusSourceModule,
  type NewAplusGradeSourceData,
} from '../types';

export const aplusGradeSourcesEqual = (
  a: AplusGradeSourceData | NewAplusGradeSourceData,
  b: AplusGradeSourceData | NewAplusGradeSourceData
): boolean => {
  if (a.sourceType !== b.sourceType || a.aplusCourse.id !== b.aplusCourse.id)
    return false;

  switch (a.sourceType) {
    case AplusGradeSourceType.FullPoints:
      return true;
    case AplusGradeSourceType.Module:
      return a.moduleId === (b as AplusSourceModule).moduleId;
    case AplusGradeSourceType.Exercise:
      return a.exerciseId === (b as AplusSourceExercise).exerciseId;
    case AplusGradeSourceType.Difficulty:
      return a.difficulty === (b as AplusSourceDifficulty).difficulty;
  }
};
