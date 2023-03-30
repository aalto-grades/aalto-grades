// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Course from '../../database/models/course';
import CourseInstance from '../../database/models/courseInstance';

import { findCourseById } from './course';
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

/**
 * Validates that course and course instance exists and that course instance belongs to the course.
 * @param {number} courseId - The ID of the course.
 * @param {number} courseId - The ID of the course instance.
 * @returns {Promise<[Course, CourseInstance]>} - The found course and course instance model object.
 * @throws {ApiError} - If the course or instance is not found, or the course instance does no
 * belong to the course, throws an error with a message indicating missing or conflicting resource.
 */
export async function validateCourseAndInstance(
  courseId: number, courseInstanceId: number
): Promise<[Course, CourseInstance]> {
  // Ensure that course exists.
  const course: Course = await findCourseById(courseId, HttpCode.NotFound);

  // Ensure that course instance exists.
  const instance: CourseInstance = await findCourseInstanceById(
    courseInstanceId, HttpCode.NotFound
  );

  // Check that instance belongs to the course.
  if (instance.courseId !== course.id) {
    throw new ApiError(
      `course instance with ID ${courseInstanceId} ` +
      `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }
  return [course, instance];
}
