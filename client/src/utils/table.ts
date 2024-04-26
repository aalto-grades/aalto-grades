// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AssessmentModelData, StudentRow} from '@common/types';
import {batchCalculateGraph} from '@common/util/calculateGraph';
import {GradeSelectOption, findBestGrade} from '.';
import {
  ExtendedStudentRow,
  GroupedStudentRow,
} from '../context/GradesTableProvider';

// Group the rows by the latest best grade date
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

// predicted grade for by model
export const predictGrades = (
  rows: StudentRow[],
  assessmentModels: AssessmentModelData[],
  gradeSelectOption: GradeSelectOption
): {[key: number]: {finalGrade: number}}[] => {
  return assessmentModels.map(model =>
    batchCalculateGraph(
      model.graphStructure,
      rows.map(row => ({
        userId: row.user.id,
        attainments: row.attainments.map(att => ({
          attainmentId: att.attainmentId,
          grade: findBestGrade(att.grades, {gradeSelectOption})?.grade ?? 0, // TODO: Handle grade expiration
        })),
      }))
    )
  );
};
