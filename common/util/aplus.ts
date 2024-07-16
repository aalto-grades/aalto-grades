// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  AplusGradeSourceData,
  AplusGradeSourceType,
  NewAplusGradeSourceData,
} from '../types';

export const aplusGradeSourcesEqual = (
  a: AplusGradeSourceData | NewAplusGradeSourceData,
  b: AplusGradeSourceData | NewAplusGradeSourceData
): boolean => {
  if (a.sourceType === b.sourceType && a.aplusCourse.id === b.aplusCourse.id) {
    switch (a.sourceType) {
      case AplusGradeSourceType.FullPoints:
        return true;
      case AplusGradeSourceType.Module:
        if (a.moduleId === (b as {moduleId: number}).moduleId) {
          return true;
        }
        break;
      case AplusGradeSourceType.Exercise:
        if (a.exerciseId === (b as {exerciseId: number}).exerciseId) {
          return true;
        }
        break;
      case AplusGradeSourceType.Difficulty:
        if (a.difficulty === (b as {difficulty: string}).difficulty) {
          return true;
        }
        break;
    }
  }

  return false;
};
