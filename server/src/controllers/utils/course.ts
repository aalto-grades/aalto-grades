// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Course from '../../database/models/course';

import { ApiError } from '../../types/error';
import { HttpCode } from '../../types/httpCode';

/**
 * Finds a course by its ID.
 * @param {number} courseId - The ID of the course.
 * @returns {Promise<Course>} - The found course model object.
 * @throws {Error} - If the course is not found, it throws an error with a message
 * indicating the missing course with the specific ID.
 */
export async function findCourseById(courseId: number): Promise<Course> {
  const course: Course | null = await Course.findByPk(courseId);
  if (!course) {
    throw new ApiError(`course with ID ${courseId} not found`, HttpCode.NotFound);
  }
  return course;
}