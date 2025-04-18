// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {type CourseData, CourseRoleType, HttpCode} from '@/common/types';
import httpLogger from '../../configs/winston';
import Course from '../../database/models/course';
import type CourseRole from '../../database/models/courseRole';
import CourseTranslation from '../../database/models/courseTranslation';
import User from '../../database/models/user';
import {ApiError, type CourseFull, stringToIdSchema} from '../../types';

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
  courseId: number
): Promise<CourseFull> => {
  const course: CourseFull | null = (await Course.findByPk(courseId, {
    include: [
      {model: CourseTranslation},
      {
        model: User,
        through: {attributes: ['role', 'expiryDate']},
      },
    ],
  })) as CourseFull | null;

  if (course === null) {
    throw new ApiError(
      `course with ID ${courseId} not found`,
      HttpCode.NotFound
    );
  }

  return course;
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
  return findCourseById(result.data);
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

/** Convert CourseFull into CourseData */
export const parseCourseFull = (course: CourseFull): CourseData => {
  const courseData: CourseData = {
    id: course.id,
    courseCode: course.courseCode,
    department: course.department,
    minCredits: course.minCredits,
    maxCredits: course.maxCredits,
    gradingScale: course.gradingScale,
    languageOfInstruction: course.languageOfInstruction,
    teachersInCharge: [],
    assistants: [],
    name: {en: '', fi: '', sv: ''},
  };

  for (const translation of course.CourseTranslations) {
    switch (translation.language) {
      case 'EN':
        courseData.name.en = translation.courseName;
        break;
      case 'FI':
        courseData.name.fi = translation.courseName;
        break;
      case 'SV':
        courseData.name.sv = translation.courseName;
        break;
    }
  }

  for (const user of course.Users) {
    const role = user.CourseRole.role;
    if (role === CourseRoleType.Student) continue;

    if (user.email === null) {
      httpLogger.error(`Teacher or assistant user ${user.id} an email`);
      throw new ApiError(
        'Teacher or assistant user is missing an email',
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
      case CourseRoleType.Assistant: {
        const assistantRoleData = {
          ...userData,
          expiryDate: user.CourseRole.expiryDate,
        };
        courseData.assistants.push(assistantRoleData);
        break;
      }
    }
  }

  return courseData;
};

/**
 * Checks that all emails are unique and are existing users.
 *
 * @throws ApiError(404|422) if that's not the case.
 */
export const validateEmailList = async (
  emailList: string[]
): Promise<User[]> => {
  const emails = new Set<string>(emailList);
  if (emails.size !== emailList.length) {
    throw new ApiError(
      'The same email cannot appear twice',
      HttpCode.UnprocessableEntity
    );
  }

  const users = await User.findAll({
    attributes: ['id', 'email'],
    where: {email: emailList},
  });

  // Check for non existent emails.
  if (emailList.length !== users.length) {
    const userEmails = new Set(users.map(user => user.email));
    const missingEmails = emailList.filter(email => !userEmails.has(email));

    for (const email of missingEmails) {
      const newUser = await User.create({email, idpUser: true});
      users.push(newUser);
    }
  }

  return users;
};

/**
 * Validate that there are no duplicates between the teachers and assistants.
 *
 * @throws ApiError(422) if duplicates found
 */
export const validateRoleUniqueness = (
  teachers: User[] | CourseRole[],
  assistants: User[] | CourseRole[]
): void => {
  const assistantIds = new Set<number>(
    assistants.map(assistant =>
      'userId' in assistant ? assistant.userId : assistant.id
    )
  );
  for (const teacher of teachers) {
    if (assistantIds.has('userId' in teacher ? teacher.userId : teacher.id)) {
      throw new ApiError(
        'Course cannot contain same user as both a teacher and assistant',
        HttpCode.UnprocessableEntity
      );
    }
  }
};
