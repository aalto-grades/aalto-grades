// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Includeable, Op} from 'sequelize';

import {HttpCode} from '@/common/types';
import {findAttainmentById} from './attainment';
import {findAndValidateCourseId, findCourseById} from './course';
import logger from '../../configs/winston';
import Attainment from '../../database/models/attainment';
import AttainmentGrade from '../../database/models/attainmentGrade';
import Course from '../../database/models/course';
import FinalGrade from '../../database/models/finalGrade';
import User from '../../database/models/user';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Retrieves the date of the latest grade for a user based on an assessment
 * model ID.
 *
 * @throws ApiError(400) if there are no grades for the user.
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
  throw new ApiError(
    `Failed to find the date of the latest grade, user ${userId} has` +
      ` no grades for course ${courseId}.`,
    HttpCode.BadRequest
  );
};

/**
 * Validates that all student numbers in the array exist
 *
 * @throws Apierror(404) If a student number is not found in the database
 */
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

    throw new ApiError(errors, HttpCode.NotFound);
  }
};

/**
 * Find all final grades for given course and student numbers
 *
 * @throws ApiError(404)
 */
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
 * Finds an attainment grade by its ID.
 *
 * @throws ApiError(404) if not found.
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

/**
 * Finds an attainment grade by id and also validates that it belongs to the
 * correct course.
 *
 * @throws ApiError(400|404|409) if invalid ids, not found, or didn't match.
 */
export const findAndValidateAttainmentGradePath = async (
  courseId: string,
  gradeId: string
): Promise<[Course, AttainmentGrade]> => {
  const result = stringToIdSchema.safeParse(gradeId);
  if (!result.success) {
    throw new ApiError(`Invalid attainment id ${gradeId}`, HttpCode.BadRequest);
  }
  const targetCourse = await findAndValidateCourseId(courseId);
  const grade = await findAttainmentGradeById(result.data);

  const attainment = await findAttainmentById(grade.attainmentId);
  const course = await findCourseById(attainment.courseId);

  // Check that assessment model belongs to the course.
  if (course.id !== targetCourse.id) {
    throw new ApiError(
      `Grade ID ${grade.id} ` +
        `does not belong to the course with ID ${targetCourse.id}`,
      HttpCode.Conflict
    );
  }

  return [course, grade];
};

/**
 * Validates that the user and grader of an AttainmentGrade or FinalGrade are
 * defined and that the user has a studentNumber and the grader a name.
 *
 * @throws ApiError(500) if any values are undefined or null.
 */
export const validateUserAndGrader = (
  grade: AttainmentGrade | FinalGrade
): [User & {studentNumber: string}, User] => {
  const gradeType = grade instanceof AttainmentGrade ? 'grade' : 'final grade';

  if (grade.User === undefined) {
    logger.error(`Found a ${gradeType} ${grade.id} with no user`);
    throw new ApiError(
      `Found a ${gradeType} with no user`,
      HttpCode.InternalServerError
    );
  }

  if (grade.User.studentNumber === null) {
    logger.error(
      `Found a ${gradeType} ${grade.id} where user ${grade.User.id} studentNumber was null`
    );
    throw new ApiError(
      `Found a ${gradeType} where user studentNumber was null`,
      HttpCode.InternalServerError
    );
  }

  if (grade.grader === undefined) {
    logger.error(`Found a ${gradeType} ${grade.id} with no grader`);
    throw new ApiError(
      `Found a ${gradeType} with no grader`,
      HttpCode.InternalServerError
    );
  }

  if (grade.grader.name === null) {
    logger.error(
      `Found a ${gradeType} ${grade.id} where grader ${grade.grader.id} name is null`
    );
    throw new ApiError(
      `Found a ${gradeType} where grader name is null`,
      HttpCode.InternalServerError
    );
  }

  return [grade.User as User & {studentNumber: string}, grade.grader];
};
