// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Attainment from '../../database/models/attainment';
import AttainmentGrade from '../../database/models/attainmentGrade';

/**
 * Retrieves the date of the latest grade for a user based on an assessment model ID.
 * @param {number} userId - The ID of the user.
 * @param {number} assessmentModelId - The ID of the assessment model.
 * @returns {Promise<Date>} Returns the date of the latest grade.
 * @throws {Error} Throws an error if there are no grades for the user.
 */
export async function getDateOfLatestGrade(
  userId: number,
  assessmentModelId: number
): Promise<Date> {
  const grades: Array<AttainmentGrade> = await AttainmentGrade.findAll({
    where: {
      userId: userId,
      manual: true,
    },
    include: [
      {
        model: Attainment,
        where: {
          assessmentModelId: assessmentModelId,
        },
      },
    ],
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
      `failed to find the date of the latest grade, user ${userId} has` +
        ` no grades for assessment model ${assessmentModelId}`
    );
  }
}

/**
 * Determines if a grade has expired based on its ID.
 * @param {number} gradeId - The ID of the grade.
 * @returns {Promise<boolean>} Returns true if the grade has expired, otherwise returns false.
 * @throws {Error} Throws an error if the grade ID is invalid.
 */
export async function gradeIsExpired(gradeId: number): Promise<boolean> {
  interface GradeWithAttainment extends AttainmentGrade {
    Attainment: Attainment;
  }

  const grade: GradeWithAttainment | null = (await AttainmentGrade.findByPk(
    gradeId,
    {
      include: [
        {
          model: Attainment,
        },
      ],
    }
  )) as GradeWithAttainment | null;

  if (!grade) {
    throw new Error(
      `failed to determine whether grade is expired, invalid ID ${gradeId}`
    );
  }

  const date: Date = await getDateOfLatestGrade(
    grade.userId,
    grade.Attainment.assessmentModelId
  );

  const expiryDate: Date = grade.expiryDate
    ? new Date(grade.expiryDate)
    : new Date(grade.date);

  if (!grade.expiryDate)
    expiryDate.setDate(expiryDate.getDate() + grade.Attainment.daysValid);

  return date >= expiryDate;
}
