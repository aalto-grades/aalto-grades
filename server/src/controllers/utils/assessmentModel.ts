// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import AssessmentModel from '../../database/models/assessmentModel';
import Course from '../../database/models/course';

import {HttpCode} from '@common/types';
import {ApiError, zodIdSchema} from '../../types';
import {findAndValidateCourseId} from './course';

/**
 * Finds an assessment model by id and throws ApiError if not found.
 */
export const findAssessmentModelById = async (
  assessmentModelId: number
): Promise<AssessmentModel> => {
  const assessmentModel = await AssessmentModel.findByPk(assessmentModelId);

  if (assessmentModel === null) {
    throw new ApiError(
      `assessment model with ID ${assessmentModelId} not found`,
      HttpCode.NotFound
    );
  }
  return assessmentModel;
};

/**
 * Finds an assessment model by url param id and also validates the url param.
 * Throws ApiError if not found.
 */
const findAndValidateAssessmentModelId = async (
  courseId: string
): Promise<AssessmentModel> => {
  const result = zodIdSchema.safeParse(courseId);
  if (!result.success) {
    throw new ApiError(
      `Invalid assessment model id ${courseId}`,
      HttpCode.NotFound
    );
  }
  return await findAssessmentModelById(result.data);
};

/**
 * Finds the course and the assessment model by url param ids and also validates the url params.
 * Throws ApiError if either not found.
 */
export const validateAssessmentModelPath = async (
  courseId: string,
  assessmentModelId: string
): Promise<[Course, AssessmentModel]> => {
  const course = await findAndValidateCourseId(courseId);
  const assessmentModel =
    await findAndValidateAssessmentModelId(assessmentModelId);

  // Check that assessment model belongs to the course.
  if (assessmentModel.courseId !== course.id) {
    throw new ApiError(
      `Assessment model with ID ${assessmentModel.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, assessmentModel];
};
