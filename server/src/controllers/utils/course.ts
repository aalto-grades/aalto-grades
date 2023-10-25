// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from 'aalto-grades-common/types';

import Course from '../../database/models/course';
import CourseTranslation from '../../database/models/courseTranslation';
import User from '../../database/models/user';

import {CourseData, Language} from 'aalto-grades-common/types';
import {ApiError, CourseFull} from '../../types';

/**
 * Finds a course by its ID.
 * @param {number} courseId - The ID of the course.
 * @param {HttpCode} errorCode - HTTP status code to return if the course was not found.
 * @returns {Promise<Course>} - The found course model object.
 * @throws {ApiError} - If the course is not found, it throws an error with a message
 * indicating the missing course with the specific ID.
 */
export async function findCourseById(
  courseId: number,
  errorCode: HttpCode
): Promise<Course> {
  const course: Course | null = await Course.findByPk(courseId);
  if (!course) {
    throw new ApiError(`course with ID ${courseId} not found`, errorCode);
  }
  return course;
}

/**
 * Finds a course, its translations, and the teachers in charge of that course
 * by a course ID.
 * @param {number} courseId - The ID of the course.
 * @param {HttpCode} errorCode - HTTP status code to include in ApiError if the
 * course was not found.
 * @returns {Promise<CourseFull>} - The found course model object with
 * course translation and user objects included.
 * @throws {ApiError} - If the course is not found, it throws an error with a
 * message indicating the missing course with the specific ID.
 */
export async function findCourseFullById(
  courseId: number,
  errorCode: HttpCode
): Promise<CourseFull> {
  const course: CourseFull | null = (await Course.findByPk(courseId, {
    include: [
      {
        model: CourseTranslation,
      },
      {
        model: User,
      },
    ],
  })) as CourseFull;

  if (!course) {
    throw new ApiError(`course with ID ${courseId} not found`, errorCode);
  }

  return course;
}

export function parseCourseFull(course: CourseFull): CourseData {
  const courseData: CourseData = {
    id: course.id,
    courseCode: course.courseCode,
    minCredits: course.minCredits,
    maxCredits: course.maxCredits,
    gradingScale: course.gradingScale,
    languageOfInstruction: course.languageOfInstruction as Language,
    teachersInCharge: [],
    department: {
      en: '',
      fi: '',
      sv: '',
    },
    name: {
      en: '',
      fi: '',
      sv: '',
    },
  };

  course.CourseTranslations.forEach((translation: CourseTranslation) => {
    switch (translation.language) {
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
  });

  course.Users.forEach((teacher: User) => {
    courseData.teachersInCharge.push({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
    });
  });

  return courseData;
}
