// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
  gradeSelectOption: GradeSelectOption,
  getCoursePartExpiryDate: (courseTaskId: number) => Date | null | undefined
): GroupedStudentRow[] => {
  const findLatestBestGradeDate = (row: StudentRow): string => {
    let newestDate = new Date(0);

    for (const courseTask of row.courseTasks) {
      const bestGrade = findBestGrade(
        courseTask.grades,
        getCoursePartExpiryDate(courseTask.courseTaskId),
        {
          expiredOption: 'non_expired',
          gradeSelectOption,
        }
      );
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
  gradeSelectOption: GradeSelectOption,
  getCoursePartExpiryDate: (courseTaskId: number) => Date | null | undefined
) => {
  const result: {
    [key: GradingModelData['id']]: ReturnType<typeof batchCalculateFinalGrades>;
  } = {};
  for (const gradingModel of gradingModels) {
    if (gradingModel.coursePartId !== null) continue;
    result[gradingModel.id] = batchCalculateFinalGrades(
      gradingModel,
      gradingModels,
      rows.flatMap((row) => {
        const courseTasks = row.courseTasks.flatMap((task) => {
          const grade = findBestGrade(
            task.grades,
            getCoursePartExpiryDate(task.courseTaskId),
            {expiredOption: 'non_expired', gradeSelectOption}
          )?.grade;
          return (grade === undefined)
            ? []
            : [{
                id: task.courseTaskId,
                grade: grade,
              }];
        });
        return (courseTasks.length === 0)
          ? []
          : [{
              userId: row.user.id,
              courseTasks: courseTasks,
            }];
      }
      )
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
      courseTask.courseTaskId in maxGrades
      && maxGrade !== null
      && courseTask.grades.some(grade => grade.grade > maxGrade)
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
    if (grade === undefined) continue;
    if (Object.keys(grade.courseParts ?? {}).length === 0) continue;

    if (grade.finalGrade % 1 !== 0) {
      errors.push({
        message: t('utils.grade-not-an-int'),
        type: 'InvalidPredictedGrade',
        info: {modelId: parseInt(modelId)},
      });
    }
    // If grade is out of range
    if (
      (courseScale === GradingScale.Numerical
        && !(grade.finalGrade >= 0 && grade.finalGrade <= 5))
      || (courseScale === GradingScale.PassFail
        && !(grade.finalGrade >= 0 && grade.finalGrade <= 1))
      || (courseScale === GradingScale.SecondNationalLanguage
        && !(grade.finalGrade >= 0 && grade.finalGrade <= 2))
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
              selectedGradingModel === 'any'
              || selectedGradingModel === Number(error.info.modelId)
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
              selectedGradingModel === 'any'
              || error.info.modelId === selectedGradingModel.id
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

/**
 * Gets the set of source task IDs from a list of grading models
 */
export const getGradingModelSourceIds = (
  models: GradingModelData | 'any',
  allModels: GradingModelData[] = []
): Set<number> => {
  const modelsToUse = models === 'any' ? allModels : [models];

  return new Set(
    modelsToUse
      .filter((model: any) => !model.archived)
      .flatMap((model: any) =>
        model.graphStructure.nodes
          .filter((node: any) => node.type === 'source')
          .map((node: any) => parseInt(node.id.split('-')[1]))
      )
  );
};

/**
 * Checks if a student has at least one non-expired grade in relevant tasks
 * @param studentRow - The student row to check
 * @param sourceIds - Set of task IDs that are relevant (sources in the grading model)
 * @param getCoursePartExpiryDate - Function to get expiry date for a task from course part
 * @returns Object with hasActiveGrade flag and list of active task IDs
 */
export const checkStudentActiveGrades = (
  studentRow: StudentRow,
  sourceIds: Set<number>,
  getCoursePartExpiryDate: (courseTaskId: number) => Date | null | undefined
): {hasActiveGrade: boolean; activeTaskIds: number[]} => {
  const activeTaskIds: number[] = [];
  const now = new Date();

  for (const task of studentRow.courseTasks) {
    // Only consider tasks that are part of the selected grading model
    if (!sourceIds.has(task.courseTaskId)) {
      continue;
    }

    // Get the expiry date from the course part
    const taskExpiryDate = getCoursePartExpiryDate(task.courseTaskId);

    // Check if any grade in this task is still active (not expired)
    const hasActiveGrade = task.grades.some((grade) => {
      // First check the grade's own expiryDate if it exists
      if (grade.expiryDate !== null && grade.expiryDate !== undefined) {
        const gradeExpiryDate = new Date(grade.expiryDate);
        if (now > gradeExpiryDate) {
          return false; // Grade is expired
        }
      }

      // Also check the task's expiry date from course part
      if (taskExpiryDate !== null && taskExpiryDate !== undefined) {
        const taskExpiry = new Date(taskExpiryDate);
        if (now > taskExpiry) {
          return false; // Task is expired
        }
      }

      // If we get here, the grade is not expired
      return true;
    });

    if (hasActiveGrade) {
      activeTaskIds.push(task.courseTaskId);
    }
  }

  return {
    hasActiveGrade: activeTaskIds.length > 0,
    activeTaskIds,
  };
};
