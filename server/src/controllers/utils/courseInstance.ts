// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import CourseInstance from '../../database/models/courseInstance';

import { ApiError } from '../../types/error';
import { HttpCode } from '../../types/httpCode';

/**
 * Finds a course instance by its ID.
 * @param {number} id - The ID of the course instance.
 * @param {HttpCode} errorCode - HTTP status code to return if the course instance was not found.
 * @returns {Promise<CourseInstance>} - The found course instance model object.
 * @throws {ApiError} - If the course instance is not found, it throws an error with a message
 * indicating the missing course instance with the specific ID.
 */
export async function findCourseInstanceById(
  id: number, errorCode: HttpCode
): Promise<CourseInstance> {
  const courseInstance: CourseInstance | null = await CourseInstance.findByPk(id);
  if (!courseInstance) {
    throw new ApiError(`course instance with ID ${id} not found`, errorCode);
  }
  return courseInstance;
}
