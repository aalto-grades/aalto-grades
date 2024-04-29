// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData, CourseRoleType, HttpCode, Language} from '@common/types';
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
    languageOfInstruction: course.languageOfInstruction as Language,
    teachersInCharge: [],
    assistants: [],
    department: {en: '', fi: '', sv: ''},
    name: {en: '', fi: '', sv: ''},
  };

  for (const translation of course.CourseTranslations) {
    // TODO: Mismatch in database languages and Language enum
    const language: Language.English | Language.Finnish | Language.Swedish =
      (translation.language as 'EN' | 'FI' | 'SE') === 'SE'
        ? Language.Swedish
        : (translation.language as Language.English | Language.Finnish);

    switch (language) {
      case Language.English:
        courseData.department.en = translation.department;
        courseData.name.en = translation.courseName;
        break;
      case Language.Finnish:
        courseData.department.fi = translation.department;
        courseData.name.fi = translation.courseName;
        break;
      case Language.Swedish:
        courseData.department.sv = translation.department;
        courseData.name.sv = translation.courseName;
        break;
    }
  }

  for (const user of course.Users) {
    if (user.CourseRole.role === CourseRoleType.Teacher) {
      courseData.teachersInCharge.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } else if (user.CourseRole.role === CourseRoleType.Assistant) {
      courseData.assistants.push({
        id: user.id,
        name: user.name,
        email: user.email,
      });
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
