// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AssessmentModelData, StudentRow} from '@common/types';
import {batchCalculateGraph} from '@common/util/calculateGraph';
import {findBestGrade} from '.';
import {
  ExtendedStudentRow,
  GroupedStudentRow,
} from '../context/GradesTableProvider';

// Group the rows by the last attainment date
export function groupByLastAttainmentDate(gradesList: ExtendedStudentRow[]) {
  // const result: {date: string; rows: StudentGradesTree[]}[] = [];
  function findNewestDate(row: StudentRow) {
    let newestDate = new Date('1970-01-01');
    for (const att of row.attainments) {
      const bestGradeDate = new Date(
        findBestGrade(att.grades, {
          avoidExpired: true,
          preferExpiredToNull: true,
          useLatest: false, // TODO: Read from state?
        })?.date ?? ''
      );
      // Get best grade date for each attainment and get the newest
      newestDate =
        newestDate && new Date(bestGradeDate ?? '') > newestDate
          ? bestGradeDate
          : newestDate;
    }
    return newestDate.toISOString().split('T')[0];
  }

  // Array implementation
  const result: Array<GroupedStudentRow> = [];
  for (const row of gradesList) {
    const date = findNewestDate(row);
    result.push({grouping: date, ...row});
  }
  return result;
}

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
export function predictGrades(
  rows: StudentRow[],
  assessmentModels: AssessmentModelData[]
) {
  return assessmentModels.map(model => {
    return batchCalculateGraph(
      model.graphStructure,
      rows.map(row => {
        return {
          userId: row.user.id,
          attainments: row.attainments.map(att => ({
            attainmentId: att.attainmentId,
            grade: att.grades.length === 0 ? 0 : att.grades[0].grade, // TODO: best grade should be taken 🐛
          })),
        };
      })
    );
  });
}
