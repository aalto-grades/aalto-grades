// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type AplusCourseData,
  type AplusExerciseData,
  AplusGradeSourceType,
  type NewAplusGradeSourceData,
} from '../../../common/types';

export const getLatestAplusModuleDate = (
  aplusExerciseData: AplusExerciseData
): Date =>
  aplusExerciseData.modules.sort(
    (a, b) => b.closingDate.getTime() - a.closingDate.getTime()
  )[0].closingDate;

export const newAplusGradeSource = (
  aplusCourse: AplusCourseData,
  date: Date,
  {
    module,
    exercise,
    difficulty,
  }: {
    module?: {id: number; name: string};
    exercise?: {id: number; name: string};
    difficulty?: {difficulty: string};
  }
): NewAplusGradeSourceData => {
  const base = {courseTaskId: -1, aplusCourse: aplusCourse, date: date};

  if (module !== undefined) {
    return {
      ...base,
      sourceType: AplusGradeSourceType.Module,
      moduleId: module.id,
      moduleName: module.name,
    };
  }

  if (exercise !== undefined) {
    return {
      ...base,
      sourceType: AplusGradeSourceType.Exercise,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
    };
  }

  if (difficulty !== undefined) {
    return {
      ...base,
      sourceType: AplusGradeSourceType.Difficulty,
      difficulty: difficulty.difficulty,
    };
  }

  return {
    ...base,
    sourceType: AplusGradeSourceType.FullPoints,
  };
};
