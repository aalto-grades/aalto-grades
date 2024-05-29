// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CoursePartData, HttpCode} from '@/common/types';
import {findAndValidateCourseId} from './course';
import Course from '../../database/models/course';
import Attainment from '../../database/models/coursePart';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Finds a course part by its ID.
 *
 * @throws ApiError(404) if not found
 */
export const findCoursePartById = async (id: number): Promise<Attainment> => {
  const coursePart = await Attainment.findByPk(id);
  if (!coursePart) {
    throw new ApiError(
      `Course part with ID ${id} not found`,
      HttpCode.NotFound
    );
  }
  return coursePart;
};

/** Finds all course parts of a specific grading model. */
export const findCoursePartByCourseId = async (
  courseId: number
): Promise<CoursePartData[]> => {
  const courseParts = await Attainment.findAll({
    where: {courseId: courseId},
    order: [['id', 'ASC']],
  });

  return courseParts.map(coursePart => ({
    id: coursePart.id,
    courseId: coursePart.courseId,
    name: coursePart.name,
    daysValid: coursePart.daysValid,
    archived: coursePart.archived,
  }));
};

/**
 * Finds a grading model by url param id and also validates the url param.
 *
 * @throws ApiError(400|404) if not found.
 */
const findAndValidateCoursePartId = async (
  coursePartId: string
): Promise<Attainment> => {
  const result = stringToIdSchema.safeParse(coursePartId);
  if (!result.success) {
    throw new ApiError(
      `Invalid course part id ${coursePartId}`,
      HttpCode.BadRequest
    );
  }
  return await findCoursePartById(result.data);
};

/**
 * Validates that a course part id belongs to a course.
 *
 * @throws ApiError(404|409) if course part not found or doesn't belong to the
 *   course.
 */
export const validateCoursePartBelongsToCourse = async (
  courseId: number,
  coursePartId: number
): Promise<void> => {
  const coursePart = await findCoursePartById(coursePartId);

  // Check that grading model belongs to the course.
  if (coursePart.courseId !== courseId) {
    throw new ApiError(
      `Course part ID ${coursePart.id} ` +
        `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }
};

/**
 * Finds the course and the grading model by url param ids and also validates
 * the url params.
 *
 * @throws ApiError(400|404|409) if either not found or invald or if the course
 *   part does not belong to the course.
 */
export const validateCoursePartPath = async (
  courseId: string,
  coursePartId: string
): Promise<[Course, Attainment]> => {
  const course = await findAndValidateCourseId(courseId);
  const coursePart = await findAndValidateCoursePartId(coursePartId);

  // Check that grading model belongs to the course.
  if (coursePart.courseId !== course.id) {
    throw new ApiError(
      `Course part ID ${coursePart.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, coursePart];
};
