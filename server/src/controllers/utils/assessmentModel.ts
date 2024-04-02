// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import AssessmentModel from '../../database/models/assessmentModel';
import Course from '../../database/models/course';

import {HttpCode} from '@common/types';
import {ApiError, zodIdSchema} from '../../types';
import {findAndValidateCourseId} from './course';

/**
 * Finds an assesment model by id and throws ApiError if not found.
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
 * Finds an assesment model by url param id and also validates the url param.
 */
const findAndValidateAssessmentModelId = async (
  courseId: string
): Promise<AssessmentModel> => {
  const result = zodIdSchema.safeParse(courseId);
  if (!result.success) {
    throw new ApiError(
      `Invalid assesment model id ${courseId}`,
      HttpCode.NotFound
    );
  }
  return await findAssessmentModelById(result.data);
};

/**
 * Finds the course and the assesment model by url param ids and also validates the url params.
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
      `Assessment model with ID ${assessmentModelId} ` +
        `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  return [course, assessmentModel];
};
