// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import CourseAssignment from '../../database/models/courseAssignment';

import { ApiError } from '../../types/error';
import { HttpCode } from '../../types/httpCode';

/**
 * Finds a course assignment by its ID.
 * @param {number} id - The ID of the course assignment.
 * @param {HttpCode} errorCode - HTTP status code to return if the assignment was not found.
 * @returns {Promise<CourseAssignment>} - The found course assignment model object.
 * @throws {ApiError} - If the course assignment is not found, it throws an error
 * with a message indicating the missing course assignment with the specific ID.
 */
export async function findCourseAssignmentById(
  id: number, errorCode: HttpCode
): Promise<CourseAssignment> {
  const courseAssignment: CourseAssignment | null = await CourseAssignment.findByPk(id);
  if (!courseAssignment) {
    throw new ApiError(`assignment with ID ${id} not found`, errorCode);
  }
  return courseAssignment;
}
