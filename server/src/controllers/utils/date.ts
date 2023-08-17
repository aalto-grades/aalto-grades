// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { DateOnlyString } from 'aalto-grades-common/types';

import Attainment from '../../database/models/attainment';
import AttainmentGrade from '../../database/models/attainmentGrade';

export function toDateOnlyString(date: Date | string): DateOnlyString {
  const dateOnlyRegExp: RegExp =
    /^\d{4}[/-](0?[1-9]|1[012])[/-](0?[1-9]|[12][0-9]|3[01])$/;

  function validate(dateString: string): DateOnlyString {
    if (dateOnlyRegExp.test(dateString)) {
      return dateString as DateOnlyString;
    } else {
      throw new Error(`invalid date only string ${dateString}`);
    }
  }

  if (date instanceof Date)
    return validate(date.toISOString().split('T')[0]);

  return toDateOnlyString(new Date(date));
}

export async function getDateOfLatestGrade(
  userId: number, assessmentModelId: number
): Promise<Date> {
  const grades: Array<AttainmentGrade> = await AttainmentGrade.findAll({
    where: {
      userId: userId,
      manual: true
    },
    include: [
      {
        model: Attainment,
        where: {
          assessmentModelId: assessmentModelId
        }
      }
    ]
  });

  const dates: Array<Date> = grades.map(
    (grade: AttainmentGrade) => new Date(grade.date)
  );

  let maxSoFar: Date | null = null;
  for (const date of dates) {
    if (!maxSoFar || date > maxSoFar) {
      maxSoFar = date;
    }
  }

  if (maxSoFar) {
    return maxSoFar;
  } else {
    throw new Error(
      `failed to find the date of the latest grade, user ${userId} has`
      + ` no grades for assessment model ${assessmentModelId}`
    )
  }
}
