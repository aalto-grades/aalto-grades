// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CoursePartData,
  GradingModelData,
  GradingScale,
  StudentRow,
} from '@/common/types';
import {batchCalculateGraph} from '@/common/util/calculateGraph';
import {GradeSelectOption, findBestGrade} from './bestGrade';
import {
  ExtendedStudentRow,
  GroupedStudentRow,
  RowError,
  RowErrorType,
} from '../context/GradesTableProvider';

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
    let newestDate = new Date('1970-01-01');

    for (const coursePart of row.courseParts) {
      const bestGrade = findBestGrade(coursePart.grades, {
        expiredOption: 'prefer_non_expired',
        gradeSelectOption,
      });
      const bestGradeDate =
        bestGrade === null ? new Date('1970-01-01') : new Date(bestGrade.date);

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
  let latestDate = new Date(1970, 0, 1);
  for (const coursePart of row.courseParts) {
    for (const grade of coursePart.grades) {
      if (grade.date.getTime() > latestDate.getTime()) latestDate = grade.date;
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
  [key: GradingModelData['id']]: ReturnType<typeof batchCalculateGraph>;
} => {
  const result: {
    [key: GradingModelData['id']]: ReturnType<typeof batchCalculateGraph>;
  } = {};
  for (const gradingModel of gradingModels) {
    result[gradingModel.id] = batchCalculateGraph(
      gradingModel.graphStructure,
      rows.map(row => ({
        userId: row.user.id,
        courseParts: row.courseParts.map(coursePart => ({
          coursePartId: coursePart.coursePartId,
          grade:
            findBestGrade(coursePart.grades, {gradeSelectOption})?.grade ?? 0, // TODO: Handle grade expiration
        })),
      }))
    );
  }
  return result;
};

export const invalidGradesCheck = (
  row: StudentRow,
  courseParts: CoursePartData[]
): RowError[] => {
  const errors: RowError[] = [];
  const maxGrades = Object.fromEntries(
    courseParts.map(coursePart => [coursePart.id, coursePart.maxGrade])
  );

  for (const coursePart of row.courseParts) {
    const maxGrade = maxGrades[coursePart.coursePartId];
    if (
      coursePart.coursePartId in maxGrades &&
      maxGrade !== null &&
      coursePart.grades.some(grade => grade.grade > maxGrade)
    )
      errors.push({
        message: 'Grade is higher than maximum allowed value',
        type: 'InvalidGrade',
        info: {
          columnId: coursePart.coursePartName,
        },
      });
  }

  return errors;
};

export const predictedGradesErrorCheck = (
  studentPredictedGrades: {[k: string]: {finalGrade: number}},
  courseScale: GradingScale
): RowError[] => {
  const errors: RowError[] = [];
  for (const [modelId, grade] of Object.entries(studentPredictedGrades)) {
    if (grade.finalGrade % 1 !== 0) {
      errors.push({
        message: 'The predicted grade is not an integer',
        type: 'InvalidPredictedGrade',
        info: {
          columnId: 'predictedFinalGrades',
          modelId: modelId,
        },
      });
    }
    // if grade is out of range
    if (
      (courseScale === GradingScale.Numerical &&
        !(grade.finalGrade >= 0 && grade.finalGrade <= 5)) ||
      (courseScale === GradingScale.PassFail &&
        !(grade.finalGrade >= 0 && grade.finalGrade <= 1)) ||
      (courseScale === GradingScale.SecondNationalLanguage &&
        !(grade.finalGrade >= 0 && grade.finalGrade <= 2))
    ) {
      errors.push({
        message: 'The predicted grade is out of range',
        type: 'OutOfRangePredictedGrade',
        info: {
          columnId: 'predictedFinalGrades',
          modelId: modelId,
        },
      });
    }
  }
  return errors;
};

export const getRowErrors = (
  row: StudentRow,
  courseParts: CoursePartData[],
  studentPredictedGrades: {[k: string]: {finalGrade: number}},
  courseScale: GradingScale
): RowError[] => {
  const predictedGradeErrors = predictedGradesErrorCheck(
    studentPredictedGrades,
    courseScale
  );
  const invalidGradeErrors = invalidGradesCheck(row, courseParts);
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
  selectedGradingModel: 'any' | number
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
              selectedGradingModel === Number(error.info.modelId)
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
