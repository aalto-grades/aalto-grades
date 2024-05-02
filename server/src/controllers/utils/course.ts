// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData, CourseRoleType, HttpCode} from '@common/types';
import logger from '../../configs/winston';
import Course from '../../database/models/course';
import CourseTranslation from '../../database/models/courseTranslation';
import User from '../../database/models/user';
import {ApiError, CourseFull, stringToIdSchema} from '../../types';

/**
 * Finds a course by its ID.
 *
 * @throws ApiError(404) if not found.
 */
export const findCourseById = async (courseId: number): Promise<Course> => {
  const course = await Course.findByPk(courseId);
  if (!course) {
    throw new ApiError(
      `course with ID ${courseId} not found`,
      HttpCode.NotFound
    );
  }
  return course;
};

/**
 * Finds a course, its translations, and the teachers in charge of that course
 * by a course ID.
 *
 * @throws ApiError(404) if course not found
 */
export const findCourseFullById = async (
  courseId: number,
  errorCode?: HttpCode
): Promise<CourseFull> => {
  const course: CourseFull | null = (await Course.findByPk(courseId, {
    include: [
      {model: CourseTranslation},
      {
        model: User,
        through: {attributes: ['role']},
      },
    ],
  })) as CourseFull | null;

  if (course === null) {
    throw new ApiError(
      `course with ID ${courseId} not found`,
      errorCode ?? HttpCode.NotFound
    );
  }

  return course;
};

export const parseCourseFull = (course: CourseFull): CourseData => {
  const courseData: CourseData = {
    id: course.id,
    courseCode: course.courseCode,
    minCredits: course.minCredits,
    maxCredits: course.maxCredits,
    gradingScale: course.gradingScale,
    languageOfInstruction: course.languageOfInstruction,
    teachersInCharge: [],
    assistants: [],
    department: {en: '', fi: '', sv: ''},
    name: {en: '', fi: '', sv: ''},
  };

  for (const translation of course.CourseTranslations) {
    switch (translation.language) {
      case 'EN':
        courseData.department.en = translation.department;
        courseData.name.en = translation.courseName;
        break;
      case 'FI':
        courseData.department.fi = translation.department;
        courseData.name.fi = translation.courseName;
        break;
      case 'SV':
        courseData.department.sv = translation.department;
        courseData.name.sv = translation.courseName;
        break;
    }
  }

  for (const user of course.Users) {
    const role = user.CourseRole.role;
    if (role === CourseRoleType.Student) continue;

    if (user.name === null || user.email === null) {
      logger.error(
        `Teacher or assistant user ${user.id} is missing a name or an email`
      );
      throw new ApiError(
        'Teacher or assistant user is missing a name or an email',
        HttpCode.InternalServerError
      );
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      studentNumber: user.studentNumber,
    };
    switch (role) {
      case CourseRoleType.Teacher:
        courseData.teachersInCharge.push(userData);
        break;
      case CourseRoleType.Assistant:
        courseData.assistants.push(userData);
        break;
    }
  }

  return courseData;
};

/**
 * Checks that all emails are existing users.
 *
 * @throws ApiError(422) if that's not the case.
 */
export const validateEmailList = async (
  emailList: string[]
): Promise<User[]> => {
  const users = await User.findAll({
    attributes: ['id', 'email'],
    where: {email: emailList},
  });

  // Check for non existent emails.
  if (emailList.length !== users.length) {
    const userEmails = users.map(user => user.email);
    const missingEmails = emailList.filter(
      email => !userEmails.includes(email)
    );

    throw new ApiError(
      missingEmails.map(
        (email: string) => `No user with email address ${email} found`
      ),
      HttpCode.UnprocessableEntity
    );
  }

  return users;
};

/**
 * Finds a course by url param id and also validates the url param.
 *
 * @throws ApiError(400|404) if invalid or course not found.
 */
export const findAndValidateCourseId = async (
  courseId: string
): Promise<Course> => {
  const result = stringToIdSchema.safeParse(courseId);
  if (!result.success)
    throw new ApiError(`Invalid course id ${courseId}`, HttpCode.BadRequest);
  return await findCourseById(result.data);
};

/**
 * Validates course id url param and returns it as a number.
 *
 * @throws ApiError(400|404) if invalid or course not found.
 */
export const validateCourseId = async (courseId: string): Promise<number> => {
  const result = stringToIdSchema.safeParse(courseId);
  if (!result.success)
    throw new ApiError(`Invalid course id ${courseId}`, HttpCode.BadRequest);
  await findCourseById(result.data);
  return result.data;
};
