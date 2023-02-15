// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import CourseInstance from '../../database/models/courseInstance';

/**
 * Finds a course instance by its ID.
 * @param {number} id - The ID of the course instance.
 * @returns {Promise<CourseInstance>} - The found course instance model object.
 * @throws {Error} - If the course instance is not found, it throws an error with a message
 * indicating the missing course instance  with the specific ID.
 */
export async function findCourseInstanceById(id: number): Promise<CourseInstance> {
  const courseInstance: CourseInstance | null = await CourseInstance.findByPk(id);
  if (!courseInstance) {
    throw new Error(`course instance with ID ${id} not found`);
  }
  return courseInstance;
}
