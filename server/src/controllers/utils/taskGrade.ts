// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  HttpCode,
  type StudentData,
  type TaskGradeData,
  type TeacherData,
} from '@/common/types';
import {parseAplusGradeSource} from './aplus';
import {findAndValidateCourseId} from './course';
import {findCoursePartById} from './coursePart';
import {findCourseTaskById} from './courseTask';
import httpLogger from '../../configs/winston';
import type Course from '../../database/models/course';
import CoursePart from '../../database/models/coursePart';
import CourseTask from '../../database/models/courseTask';
import type FinalGrade from '../../database/models/finalGrade';
import TaskGrade from '../../database/models/taskGrade';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Retrieves the date of the latest grade for a user based on a course ID.
 *
 * @throws ApiError(400) if there are no grades for the user.
 */
export const getDateOfLatestGrade = async (
  userId: number,
  courseId: number
): Promise<Date> => {
  const grades = await TaskGrade.findAll({
    where: {userId},
    include: [
      {
        model: CourseTask,
        include: [{model: CoursePart, where: {courseId}}],
      },
    ],
  });

  if (grades.length === 0) {
    throw new ApiError(
      `Failed to find the date of the latest grade, user ${userId} has` +
        ` no grades for course ${courseId}.`,
      HttpCode.BadRequest
    );
  }

  let maxSoFar = new Date(0);
  for (const grade of grades) {
    if (new Date(grade.date) > maxSoFar) maxSoFar = new Date(grade.date);
  }
  return maxSoFar;
};

/**
 * Validates that the user and grader of an AttainmentGrade or FinalGrade are
 * defined and that the user has a studentNumber and the grader a name.
 *
 * @throws ApiError(500) if any values are undefined or null.
 */
export const validateUserAndGrader = (
  grade: TaskGrade | FinalGrade
): [StudentData, TeacherData] => {
  const gradeType = grade instanceof TaskGrade ? 'grade' : 'final grade';

  if (grade.User === undefined) {
    httpLogger.error(`Found a ${gradeType} ${grade.id} with no user`);
    throw new ApiError(
      `Found a ${gradeType} with no user`,
      HttpCode.InternalServerError
    );
  }

  if (grade.User.studentNumber === null) {
    httpLogger.error(
      `Found a ${gradeType} ${grade.id} where user ${grade.User.id} studentNumber was null`
    );
    throw new ApiError(
      `Found a ${gradeType} where user studentNumber was null`,
      HttpCode.InternalServerError
    );
  }

  if (grade.grader === undefined) {
    httpLogger.error(`Found a ${gradeType} ${grade.id} with no grader`);
    throw new ApiError(
      `Found a ${gradeType} with no grader`,
      HttpCode.InternalServerError
    );
  }

  if (grade.grader.email === null) {
    httpLogger.error(
      `Found a ${gradeType} ${grade.id} where grader ${grade.grader.id} email is null`
    );
    throw new ApiError(
      `Found a ${gradeType} where grader email is null`,
      HttpCode.InternalServerError
    );
  }

  return [
    {
      id: grade.User.id,
      name: grade.User.name,
      email: grade.User.email,
      studentNumber: grade.User.studentNumber,
    },
    {
      id: grade.grader.id,
      name: grade.grader.name,
      email: grade.grader.email,
      studentNumber: grade.grader.studentNumber,
    },
  ];
};

/** Converts taskGrade database object into the TaskGradeData type */
export const parseTaskGrade = (taskGrade: TaskGrade): TaskGradeData => {
  const [, grader] = validateUserAndGrader(taskGrade);
  return {
    gradeId: taskGrade.id,
    grader: grader,
    aplusGradeSource: taskGrade.AplusGradeSource
      ? parseAplusGradeSource(taskGrade.AplusGradeSource)
      : null,
    grade: taskGrade.grade,
    date: new Date(taskGrade.date),
    expiryDate:
      taskGrade.expiryDate === null ? null : new Date(taskGrade.expiryDate),
    comment: taskGrade.comment,
  };
};

/**
 * Finds a grade by its ID.
 *
 * @throws ApiError(404) if not found.
 */
export const findGradeById = async (id: number): Promise<TaskGrade> => {
  const grade = await TaskGrade.findByPk(id);
  if (grade === null) {
    throw new ApiError(`Grade with ID ${id} not found`, HttpCode.NotFound);
  }
  return grade;
};

/**
 * Finds a grade by id and also validates that it belongs to the correct course.
 *
 * @throws ApiError(400|404|409) if invalid ids, not found, or didn't match.
 */
export const findAndValidateGradePath = async (
  courseId: string,
  gradeId: string
): Promise<[Course, TaskGrade]> => {
  const result = stringToIdSchema.safeParse(gradeId);
  if (!result.success) {
    throw new ApiError(`Invalid grade ID ${gradeId}`, HttpCode.BadRequest);
  }

  const course = await findAndValidateCourseId(courseId);
  const grade = await findGradeById(result.data);
  const courseTask = await findCourseTaskById(grade.courseTaskId);
  const coursePart = await findCoursePartById(courseTask.coursePartId);

  if (coursePart.courseId !== course.id) {
    throw new ApiError(
      `Grade with ID ${gradeId} ` +
        `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  return [course, grade];
};
