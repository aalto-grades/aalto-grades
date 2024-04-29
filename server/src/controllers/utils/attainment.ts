// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, HttpCode} from '@common/types';
import Attainment from '../../database/models/attainment';
import Course from '../../database/models/course';
import {ApiError, stringToIdSchema} from '../../types';
import {findAndValidateCourseId} from './course';

/**
 * Finds an attainment by its ID.
 *
 * @throws ApiError(404) if not found
 */
export const findAttainmentById = async (id: number): Promise<Attainment> => {
  const attainment = await Attainment.findByPk(id);
  if (!attainment) {
    throw new ApiError(`attainment with ID ${id} not found`, HttpCode.NotFound);
  }
  return attainment;
};

/** Finds all attainments of a specific assessment model. */
export const findAttainmentsByCourseId = async (
  courseId: number
): Promise<AttainmentData[]> => {
  const attainments = await Attainment.findAll({
    where: {courseId: courseId},
    order: [['id', 'ASC']],
  });

  return attainments.map(attainment => ({
    id: attainment.id,
    courseId: attainment.courseId,
    name: attainment.name,
    daysValid: attainment.daysValid,
  }));
};

/**
 * Finds an assessment model by url param id and also validates the url param.
 *
 * @throws ApiError(400,404) if not found.
 */
const findAndValidateAttainmentId = async (
  attainmentId: string
): Promise<Attainment> => {
  const result = stringToIdSchema.safeParse(attainmentId);
  if (!result.success) {
    throw new ApiError(
      `Invalid attainment id ${attainmentId}`,
      HttpCode.BadRequest
    );
  }
  return await findAttainmentById(result.data);
};

/**
 * Validates that an attainment id belongs to a course.
 *
 * @throws ApiError(404|409) if attainment not found or doesn't belong to the
 *   course.
 */
export const validateAttainmentBelongsToCourse = async (
  courseId: number,
  attainmentId: number
): Promise<void> => {
  const attainment = await findAttainmentById(attainmentId);

  // Check that assessment model belongs to the course.
  if (attainment.courseId !== courseId) {
    throw new ApiError(
      `Attainment ID ${attainment.id} ` +
        `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }
};

/**
 * Finds the course and the assessment model by url param ids and also validates
 * the url params.
 *
 * @throws ApiError(400|404|409) if either not found or invald or if the
 *   attainment does not belong to the course.
 */
export const validateAttainmentPath = async (
  courseId: string,
  attainmentId: string
): Promise<[Course, Attainment]> => {
  const course = await findAndValidateCourseId(courseId);
  const attainment = await findAndValidateAttainmentId(attainmentId);

  // Check that assessment model belongs to the course.
  if (attainment.courseId !== course.id) {
    throw new ApiError(
      `Attainment ID ${attainment.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, attainment];
};
