// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, HttpCode} from '@/common/types';
import {findAndValidateCourseId, findCourseById} from './course';
import AssessmentModel from '../../database/models/assessmentModel';
import Course from '../../database/models/course';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Finds a grading model by id.
 *
 * @throws ApiError(404) if not found.
 */
export const findAssessmentModelById = async (
  assessmentModelId: number
): Promise<AssessmentModel> => {
  const assessmentModel = await AssessmentModel.findByPk(assessmentModelId);

  if (assessmentModel === null) {
    throw new ApiError(
      `grading model with ID ${assessmentModelId} not found`,
      HttpCode.NotFound
    );
  }
  return assessmentModel;
};

/** Checks if grading model has deleted or archived attainments. */
export const checkAssessmentModelAttainments = (
  assessmentModel: AssessmentModel,
  attainmentData: AttainmentData[]
): {hasDeletedAttainments: boolean; hasArchivedAttainments: boolean} => {
  let hasDeleted = false;
  let hasArchived = false;

  const attainmentIds = attainmentData.map(att => att.id);
  const modelAttainmentIds = [];
  for (const node of assessmentModel.graphStructure.nodes) {
    if (node.type !== 'attainment') continue;
    modelAttainmentIds.push(parseInt(node.id.split('-')[1]));
  }

  for (const attId of modelAttainmentIds) {
    if (!attainmentIds.includes(attId)) hasDeleted = true;
  }
  for (const att of attainmentData) {
    if (modelAttainmentIds.includes(att.id) && att.archived) hasArchived = true;
  }

  return {
    hasDeletedAttainments: hasDeleted,
    hasArchivedAttainments: hasArchived,
  };
};

/**
 * Finds a grading model by url param id and also validates the url param.
 *
 * @throws ApiError(400|404) if invalid or not found.
 */
const findAndValidateAssessmentModelId = async (
  courseId: string
): Promise<AssessmentModel> => {
  const result = stringToIdSchema.safeParse(courseId);
  if (!result.success) {
    throw new ApiError(
      `Invalid grading model id ${courseId}`,
      HttpCode.BadRequest
    );
  }
  return await findAssessmentModelById(result.data);
};

/**
 * Finds the course and the grading model and validates that the model belongs
 * to the course.
 *
 * @throws ApiError(404|409) if either not found or grading model does not
 *   belong to the course.
 */
export const validateAssessmentModelBelongsToCourse = async (
  courseId: number,
  assessmentModelId: number
): Promise<[Course, AssessmentModel]> => {
  const course = await findCourseById(courseId);
  const assessmentModel = await findAssessmentModelById(assessmentModelId);

  // Check that grading model belongs to the course.
  if (assessmentModel.courseId !== course.id) {
    throw new ApiError(
      `Grading model with ID ${assessmentModel.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, assessmentModel];
};

/**
 * Finds the course and the grading model by url param ids and also validates
 * the url params.
 *
 * @throws ApiError(400|404|409) if either invalid or not found or assessment
 *   model does not belong to the course.
 */
export const validateAssessmentModelPath = async (
  courseId: string,
  assessmentModelId: string
): Promise<[Course, AssessmentModel]> => {
  const course = await findAndValidateCourseId(courseId);
  const assessmentModel =
    await findAndValidateAssessmentModelId(assessmentModelId);

  // Check that grading model belongs to the course.
  if (assessmentModel.courseId !== course.id) {
    throw new ApiError(
      `Grading model with ID ${assessmentModel.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, assessmentModel];
};
