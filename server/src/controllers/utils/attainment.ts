// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, HttpCode} from '@common/types';
import Attainment from '../../database/models/attainment';
import Course from '../../database/models/course';
import {ApiError, zodIdSchema} from '../../types';
import {findAndValidateCourseId} from './course';

/**
 * Finds an attainment by its ID and throws ApiError if not found
 */
export const findAttainmentById = async (id: number): Promise<Attainment> => {
  const attainment = await Attainment.findByPk(id);
  if (!attainment) {
    throw new ApiError(`attainment with ID ${id} not found`, HttpCode.NotFound);
  }
  return attainment;
};

/**
 * Finds all attainments of a specific assessment model.
 */
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
 * Throws ApiError if not found.
 */
const findAndValidateAttainmentId = async (
  attainmentId: string
): Promise<Attainment> => {
  const result = zodIdSchema.safeParse(attainmentId);
  if (!result.success) {
    throw new ApiError(
      `Invalid attainment id ${attainmentId}`,
      HttpCode.NotFound
    );
  }
  return await findAttainmentById(result.data);
};

/**
 * Finds the course and the assessment model by url param ids and also validates the url params.
 * Throws ApiError if either not found.
 */
export async function validateAttainmentPath(
  courseId: string,
  attainmentId: string
): Promise<[Course, Attainment]> {
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
}
