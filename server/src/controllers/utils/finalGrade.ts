// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@/common/types';
import {findAndValidateCourseId} from './course';
import Course from '../../database/models/course';
import FinalGrade from '../../database/models/finalGrade';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Finds a final grade by its ID.
 *
 * @throws ApiError(404) if not found.
 */
export const findFinalGradeById = async (id: number): Promise<FinalGrade> => {
  const attainment = await FinalGrade.findByPk(id);
  if (attainment === null) {
    throw new ApiError(
      `Final grade with ID ${id} not found`,
      HttpCode.NotFound
    );
  }
  return attainment;
};

/**
 * Finds a final grade by id and also validates that it belongs to the correct
 * course.
 *
 * @throws ApiError(400|404|409) if invalid ids, not found, or didn't match.
 */
export const findAndValidateFinalGradePath = async (
  courseId: string,
  fGradeId: string
): Promise<[Course, FinalGrade]> => {
  const result = stringToIdSchema.safeParse(fGradeId);
  if (!result.success) {
    throw new ApiError(
      `Invalid final grade ID ${fGradeId}`,
      HttpCode.BadRequest
    );
  }
  const course = await findAndValidateCourseId(courseId);
  const fGrade = await findFinalGradeById(result.data);

  // Check that final grade belongs to the course.
  if (fGrade.courseId !== course.id) {
    throw new ApiError(
      `Final grade ID ${fGradeId} ` +
        `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  return [course, fGrade];
};
