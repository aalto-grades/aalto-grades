// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {TFunction} from 'i18next';

import {
  type CourseTaskData,
  type FinalGradeData,
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
 * Source IDs of the (non-archived) sources in a grading model.
 * In course part models source node IDs are course task IDs, while in
 * final-grade models (coursePartId === null) they are course part IDs.
 */
export type GradingModelSourceIds = {
  taskIds: Set<number>;
  partIds: Set<number>;
};

/**
 * Gets the set of source task IDs and course part IDs from a grading model
 * (or from all models when 'any' is selected)
 */
export const getGradingModelSourceIds = (
  models: GradingModelData | 'any',
  allModels: GradingModelData[] = []
): GradingModelSourceIds => {
  const modelsToUse = models === 'any' ? allModels : [models];

  const taskIds = new Set<number>();
  const partIds = new Set<number>();

  for (const model of modelsToUse) {
    if (model.archived) continue;
    const ids = model.graphStructure.nodes
      .filter(node => node.type === 'source')
      .map(node => parseInt(node.id.split('-')[1]));

    if (model.coursePartId === null) {
      for (const id of ids) partIds.add(id);
    } else {
      for (const id of ids) taskIds.add(id);
    }
  }

  return {taskIds, partIds};
};

/**
 * Checks if a student has at least one non-expired grade in relevant tasks
 * @param studentRow - The student row to check
 * @param sourceIds - IDs of the sources in the grading model (task or part IDs)
 * @param courseTasks - Course task metadata, used to map tasks to course parts
 * @param getCoursePartExpiryDate - Function to get expiry date for a task from course part
 * @returns Object with hasActiveGrade flag and list of active task IDs
 */
export const checkStudentActiveGrades = (
  studentRow: StudentRow,
  sourceIds: GradingModelSourceIds,
  courseTasks: CourseTaskData[],
  getCoursePartExpiryDate: (courseTaskId: number) => Date | null | undefined
): {hasActiveGrade: boolean; activeTaskIds: number[]} => {
  const activeTaskIds: number[] = [];
  const now = new Date();

  const coursePartIdByTaskId = new Map(
    courseTasks.map(task => [task.id, task.coursePartId])
  );

  for (const task of studentRow.courseTasks) {
    // Only consider tasks that are part of the selected grading model.
    // A task is relevant if it is a source itself, or if it belongs to a
    // course part that is a source (final-grade models).
    const partId = coursePartIdByTaskId.get(task.courseTaskId);
    const inPartSource = partId !== undefined && sourceIds.partIds.has(partId);
    if (!sourceIds.taskIds.has(task.courseTaskId) && !inPartSource) {
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

/**
 * Finds a previous grade that has been exported to Sisu, excluding the best
 * grade.
 *
 * @returns The previous grade that has been exported to Sisu, or null if not
 *   found.
 */
export const findPreviouslyExportedToSisu = (
  bestGrade: FinalGradeData,
  row: StudentRow
): FinalGradeData | null => {
  for (const fg of row.finalGrades) {
    if (bestGrade.id === fg.id) continue; // Skip the best grade
    if (fg.sisuExportDate === null) continue; // And those not exported to sisu

    if (bestGrade.sisuExportDate !== null) {
      // If the best grade is also exported, we need to check which one is newer
      if (bestGrade.sisuExportDate < fg.sisuExportDate) return fg;
    } else {
      return fg;
    }
  }
  return null;
};
