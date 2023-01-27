// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import models from '../database/models';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';

export interface CourseWithTranslation extends Course {
  CourseTranslations: Array<CourseTranslation>
}

/**
 * Finds a course by its id, and include data from the CourseTranslation model.
 * @param {number} courseId - The id of the course to be found.
 * @returns {Promise<CourseWithTranslation>} - A promise that resolves with the found course object.
 * @throws {Error} - If the course is not found, throws an error with a message indicating the missing course.
 */
export async function findCourseById(courseId: number): Promise<CourseWithTranslation> {

  const course: Course | null = await models.Course.findByPk(courseId, {
    attributes: ['id', 'courseCode', 'minCredits', 'maxCredits'],
    include: {
      model: CourseTranslation,
      attributes: ['language', 'courseName', 'department'],
    }
  });

  if (!course) throw new Error (`course with an id ${courseId} not found`);

  return course as CourseWithTranslation;
}
