// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {TFunction} from 'i18next';

import {
  type CourseTaskData,
  type GradingModelData,
  GradingScale,
  type StudentRow,
} from '@/common/types';
import {batchCalculateFinalGrades} from '@/common/util';
import type {
  ExtendedStudentRow,
  GroupedStudentRow,
  PredictedGraphValues,
  RowError,
  RowErrorType,
} from '@/context/GradesTableProvider';
import {type GradeSelectOption, findBestGrade} from './bestGrade';

/**
 * Groups the student rows by their latest best grade date.
 *
 * @param gradesList - The list of extended student rows.
 * @param gradeSelectOption - The grade select option.
 * @returns An array of grouped student rows.
 */
export const groupByLatestBestGrade = (
  gradesList: ExtendedStudentRow[],
  gradeSelectOption: GradeSelectOption
): GroupedStudentRow[] => {
  const findLatestBestGradeDate = (row: StudentRow): string => {
    let newestDate = new Date(0);

    for (const courseTask of row.courseTasks) {
      const bestGrade = findBestGrade(courseTask.grades, {
        expiredOption: 'prefer_non_expired',
        gradeSelectOption,
      });
      const bestGradeDate =
        bestGrade === null ? new Date(0) : new Date(bestGrade.date);

      // Get best grade date for each course part and get the newest
      if (bestGradeDate > newestDate) newestDate = bestGradeDate;
    }
    return newestDate.toISOString().split('T')[0];
  };

  // Array implementation
  const result: GroupedStudentRow[] = [];
  for (const row of gradesList) {
    result.push({...row, latestBestGrade: findLatestBestGradeDate(row)});
  }
  return result;
};

export const findLatestGrade = (row: StudentRow): Date => {
  let latestDate = new Date(0);
  for (const courseTask of row.courseTasks) {
    for (const grade of courseTask.grades) {
      if (grade.date > latestDate) latestDate = grade.date;
    }
  }
  return latestDate;
};

/**
 * Predicts grades based on grading models and student rows.
 *
 * @param rows - An array of student rows.
 * @param gradingModels - An array of grading models.
 * @param gradeSelectOption - The grade select option.
 * @returns
 */
export const predictGrades = (
  rows: StudentRow[],
  gradingModels: GradingModelData[],
  gradeSelectOption: GradeSelectOption
): {
  [key: GradingModelData['id']]: ReturnType<typeof batchCalculateFinalGrades>;
} => {
  const result: {
    [key: GradingModelData['id']]: ReturnType<typeof batchCalculateFinalGrades>;
  } = {};
  for (const gradingModel of gradingModels) {
    if (gradingModel.coursePartId !== null) continue;
    result[gradingModel.id] = batchCalculateFinalGrades(
      gradingModel,
      gradingModels,
      rows.map(row => ({
        userId: row.user.id,
        courseTasks: row.courseTasks.map(task => ({
          id: task.courseTaskId,
          // TODO: Manage expired task grades? (#696)
          grade: findBestGrade(task.grades, {gradeSelectOption})?.grade ?? 0,
        })),
      }))
    );
  }
  return result;
};

export const invalidGradesCheck = (
  t: TFunction,
  row: StudentRow,
  courseTasks: CourseTaskData[]
): RowError[] => {
  const errors: RowError[] = [];
  const maxGrades = Object.fromEntries(
    courseTasks.map(courseTask => [courseTask.id, courseTask.maxGrade])
  );

  for (const courseTask of row.courseTasks) {
    const maxGrade = maxGrades[courseTask.courseTaskId];
    if (
      courseTask.courseTaskId in maxGrades &&
      maxGrade !== null &&
      courseTask.grades.some(grade => grade.grade > maxGrade)
    )
      errors.push({
        message: t('utils.grade-higher-than-max'),
        type: 'InvalidGrade',
        info: {
          columnId: courseTask.courseTaskName,
        },
      });
  }

  return errors;
};

export const predictedGradesErrorCheck = (
  t: TFunction,
  studentPredictedGrades: PredictedGraphValues,
  courseScale: GradingScale
): RowError[] => {
  const errors: RowError[] = [];
  for (const [modelId, grade] of Object.entries(studentPredictedGrades)) {
    // Check if model is a course part model.
    if (Object.keys(grade.courseParts).length === 0) continue;

    if (grade.finalGrade % 1 !== 0) {
      errors.push({
        message: t('utils.grade-not-an-int'),
        type: 'InvalidPredictedGrade',
        info: {modelId: parseInt(modelId)},
      });
    }
    // If grade is out of range
    if (
      (courseScale === GradingScale.Numerical &&
        !(grade.finalGrade >= 0 && grade.finalGrade <= 5)) ||
      (courseScale === GradingScale.PassFail &&
        !(grade.finalGrade >= 0 && grade.finalGrade <= 1)) ||
      (courseScale === GradingScale.SecondNationalLanguage &&
        !(grade.finalGrade >= 0 && grade.finalGrade <= 2))
    ) {
      errors.push({
        message: t('utils.grade-out-of-range'),
        type: 'OutOfRangePredictedGrade',
        info: {modelId: parseInt(modelId)},
      });
    }
  }
  return errors;
};

export const getRowErrors = (
  t: TFunction,
  row: StudentRow,
  courseTasks: CourseTaskData[],
  studentPredictedGrades: PredictedGraphValues,
  courseScale: GradingScale
): RowError[] => {
  const predictedGradeErrors = predictedGradesErrorCheck(
    t,
    studentPredictedGrades,
    courseScale
  );
  const invalidGradeErrors = invalidGradesCheck(t, row, courseTasks);
  return [...predictedGradeErrors, ...invalidGradeErrors];
};

/**
 * Returns the types of errors that occurred
 *
 * @param rowModel - The array of grouped student rows.
 * @param selectedGradingModel - The selected grading model. Can be 'any' or a
 *   number (modelId).
 * @returns The types of errors that occurred.
 */
export const getErrorTypes = (
  rowModel: GroupedStudentRow[],
  selectedGradingModel: 'any' | number
): Record<RowErrorType, boolean> => {
  const errorTypes: Record<RowErrorType, boolean> = {
    Error: false,
    InvalidGrade: false,
    InvalidPredictedGrade: false,
    OutOfRangePredictedGrade: false,
  };

  for (const row of rowModel) {
    if (row.errors) {
      for (const error of row.errors) {
        switch (error.type) {
          case 'OutOfRangePredictedGrade':
          case 'InvalidPredictedGrade':
            if (
              selectedGradingModel === 'any' ||
              selectedGradingModel === Number(error.info.modelId)
            ) {
              errorTypes[error.type] = true;
            }
            break;
          default:
            errorTypes[error.type] = true;
            break;
        }
      }
    }
  }

  return errorTypes;
};

/**
 * Calculates the total count of errors in the given row model and selected
 * grading model.
 *
 * @param rowModel - The array of grouped student rows.
 * @param selectedGradingModel - The selected grading model. Can be 'any' or a
 *   number (modelId).
 * @returns The total count of errors.
 */
export const getErrorCount = (
  rowModel: GroupedStudentRow[],
  selectedGradingModel: GradingModelData | 'any'
): number => {
  let totalErrors = 0;

  for (const row of rowModel) {
    if (row.errors) {
      for (const error of row.errors) {
        switch (error.type) {
          case 'OutOfRangePredictedGrade':
          case 'InvalidPredictedGrade':
            if (
              selectedGradingModel === 'any' ||
              error.info.modelId === selectedGradingModel.id
            ) {
              totalErrors += 1;
            }
            break;
          default:
            totalErrors += 1;
            break;
        }
      }
    }
  }

  return totalErrors;
};
