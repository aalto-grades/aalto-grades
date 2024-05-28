// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {GradingModelData, StudentRow} from '@/common/types';
import {batchCalculateGraph} from '@/common/util/calculateGraph';
import {GradeSelectOption, findBestGrade} from '.';
import {
  ExtendedStudentRow,
  GroupedStudentRow,
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

    for (const att of row.attainments) {
      const bestGrade = findBestGrade(att.grades, {
        expiredOption: 'prefer_non_expired',
        gradeSelectOption,
      });
      const bestGradeDate =
        bestGrade === null ? new Date('1970-01-01') : new Date(bestGrade.date);

      // Get best grade date for each attainment and get the newest
      if (bestGradeDate > newestDate) newestDate = bestGradeDate;
    }
    return newestDate.toISOString().split('T')[0];
  };

  // Array implementation
  const result: GroupedStudentRow[] = [];
  for (const row of gradesList) {
    result.push({...row, grouping: findLatestBestGradeDate(row)});
  }
  return result;
};

export const findLatestGrade = (row: StudentRow): Date => {
  let latestDate = new Date(1970, 0, 1);
  for (const att of row.attainments) {
    for (const grade of att.grades) {
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
        attainments: row.attainments.map(att => ({
          attainmentId: att.attainmentId,
          grade: findBestGrade(att.grades, {gradeSelectOption})?.grade ?? 0,
        })),
      }))
    );
  }
  return result;
  // return gradingModels.map(model =>
  //   batchCalculateGraph(
  //     model.graphStructure,
  //     rows.map(row => ({
  //       userId: row.user.id,
  //       attainments: row.attainments.map(att => ({
  //         attainmentId: att.attainmentId,
  //         grade: findBestGrade(att.grades, {gradeSelectOption})?.grade ?? 0, // TODO: Handle grade expiration
  //       })),
  //     }))
  //   )
  // );
};
