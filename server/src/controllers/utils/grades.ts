// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@common/types';
import {Includeable, Op} from 'sequelize';
import Attainment from '../../database/models/attainment';
import AttainmentGrade from '../../database/models/attainmentGrade';
import FinalGrade from '../../database/models/finalGrade';
import User from '../../database/models/user';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Retrieves the date of the latest grade for a user based on an assessment model ID.
 * Throws Error if there are no grades for the user.
 */
export const getDateOfLatestGrade = async (
  userId: number,
  courseId: number
): Promise<Date> => {
  const grades = await AttainmentGrade.findAll({
    where: {userId: userId},
    include: [
      {
        model: Attainment,
        where: {courseId: courseId},
      },
    ],
  });

  const dates = grades.map(grade => new Date(grade.date));
  let maxSoFar = null;
  for (const date of dates) {
    if (!maxSoFar || date > maxSoFar) {
      maxSoFar = date;
    }
  }

  if (maxSoFar) return maxSoFar;
  throw new Error(
    `Failed to find the date of the latest grade, user ${userId} has` +
      ` no grades for course ${courseId}.`
  );
};

/**
 * Determines if a grade has expired based on its ID.
 * Throws Error if the grade ID is invalid.
 */
export const gradeIsExpired = async (gradeId: number): Promise<boolean> => {
  const grade = await AttainmentGrade.findByPk(gradeId);

  if (grade === null) {
    throw new Error(
      `failed to determine whether grade is expired, invalid ID ${gradeId}`
    );
  }

  return new Date().getTime() >= new Date(grade.expiryDate).getTime();
};

export const studentNumbersExist = async (
  studentNumbers: string[]
): Promise<void> => {
  const foundStudentNumbers = (
    await User.findAll({
      attributes: ['studentNumber'],
      where: {
        studentNumber: {[Op.in]: studentNumbers},
      },
    })
  ).map(student => student.studentNumber);

  if (foundStudentNumbers.length !== studentNumbers.length) {
    const errors: string[] = [];

    for (const studentNumber of studentNumbers) {
      if (!foundStudentNumbers.includes(studentNumber)) {
        errors.push(`user with student number ${studentNumber} not found`);
      }
    }

    throw new ApiError(errors, HttpCode.UnprocessableEntity);
  }
};

export const getFinalGradesFor = async (
  courseId: number,
  studentNumbers: string[],
  skipErrorOnEmpty: boolean = false
): Promise<FinalGrade[]> => {
  // Prepare base query options for User.
  const userQueryOptions: Includeable = {
    model: User,
    attributes: ['id', 'studentNumber'],
  };

  // Conditionally add a where clause if student numbers are included in the
  // function call
  if (studentNumbers.length !== 0) {
    userQueryOptions.where = {
      studentNumber: {
        [Op.in]: studentNumbers,
      },
    };
  }

  const finalGrades = await FinalGrade.findAll({
    where: {courseId: courseId},
    include: [
      {
        model: User,
        required: true,
        as: 'grader',
        attributes: ['id', 'name'],
      },
      userQueryOptions,
    ],
    order: [['id', 'ASC']],
  });

  if (finalGrades.length === 0 && !skipErrorOnEmpty) {
    throw new ApiError(
      'no grades found, make sure grades have been ' +
        'uploaded/calculated before requesting course results',
      HttpCode.NotFound
    );
  }

  return finalGrades;
};

/**
 * Finds an attainment grade by its ID. Throws ApiError if not found.
 */
export const findAttainmentGradeById = async (
  id: number
): Promise<AttainmentGrade> => {
  const attainment = await AttainmentGrade.findByPk(id);
  if (attainment === null) {
    throw new ApiError(
      `attainment grade with ID ${id} not found`,
      HttpCode.NotFound
    );
  }
  return attainment;
};

export const findAndValidateAttainmentGrade = async (
  gradeId: string
): Promise<AttainmentGrade> => {
  const result = stringToIdSchema.safeParse(gradeId);
  if (!result.success) {
    throw new ApiError(`Invalid attainment id ${gradeId}`, HttpCode.BadRequest);
  }
  return await findAttainmentGradeById(result.data);
};
