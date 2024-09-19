// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type CoursePartData,
  type CourseTaskData,
  HttpCode,
} from '@/common/types';
import {findAndValidateCourseId, findCourseById} from './course';
import type Course from '../../database/models/course';
import GradingModel from '../../database/models/gradingModel';
import {ApiError, stringToIdSchema} from '../../types';

/**
 * Finds a grading model by id.
 *
 * @throws ApiError(404) if not found.
 */
export const findGradingModelById = async (
  gradingModelId: number
): Promise<GradingModel> => {
  const gradingModel = await GradingModel.findByPk(gradingModelId);

  if (gradingModel === null) {
    throw new ApiError(
      `grading model with ID ${gradingModelId} not found`,
      HttpCode.NotFound
    );
  }
  return gradingModel;
};

/** Checks if grading model has deleted or archived course sources. */
export const checkGradingModelSources = (
  gradingModel: GradingModel,
  sources: CourseTaskData[] | CoursePartData[]
): {
  hasExpiredSources: boolean;
  hasDeletedSources: boolean;
  hasArchivedSources: boolean;
} => {
  const now = new Date();

  let hasExpiredSources = false;
  let hasDeletedSources = false;
  let hasArchivedSources = false;

  const modelSourceIds = [];
  for (const node of gradingModel.graphStructure.nodes) {
    if (node.type !== 'source') continue;
    modelSourceIds.push(parseInt(node.id.split('-')[1]));
  }

  const sourceIds = new Set(sources.map(source => source.id));
  for (const sourceId of modelSourceIds) {
    if (!sourceIds.has(sourceId)) hasDeletedSources = true;
  }
  for (const source of sources) {
    if (modelSourceIds.includes(source.id) && source.archived)
      hasArchivedSources = true;
    if ('expiryDate' in source && source.expiryDate && source.expiryDate < now)
      hasExpiredSources = true;
  }

  return {
    hasExpiredSources,
    hasDeletedSources,
    hasArchivedSources,
  };
};

/**
 * Finds a grading model by url param id and also validates the url param.
 *
 * @throws ApiError(400|404) if invalid or not found.
 */
const findAndValidateGradingModelId = async (
  courseId: string
): Promise<GradingModel> => {
  const result = stringToIdSchema.safeParse(courseId);
  if (!result.success) {
    throw new ApiError(
      `Invalid grading model id ${courseId}`,
      HttpCode.BadRequest
    );
  }
  return findGradingModelById(result.data);
};

/**
 * Finds the course and the grading model and validates that the model belongs
 * to the course.
 *
 * @throws ApiError(404|409) if either not found or grading model does not
 *   belong to the course.
 */
export const validateGradingModelBelongsToCourse = async (
  courseId: number,
  gradingModelId: number
): Promise<[Course, GradingModel]> => {
  const course = await findCourseById(courseId);
  const gradingModel = await findGradingModelById(gradingModelId);

  // Check that grading model belongs to the course.
  if (gradingModel.courseId !== course.id) {
    throw new ApiError(
      `Grading model with ID ${gradingModel.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, gradingModel];
};

/**
 * Finds the course and the grading model by url param ids and also validates
 * the url params.
 *
 * @throws ApiError(400|404|409) if either invalid or not found or grading model
 *   does not belong to the course.
 */
export const validateGradingModelPath = async (
  courseId: string,
  gradingModelId: string
): Promise<[Course, GradingModel]> => {
  const course = await findAndValidateCourseId(courseId);
  const gradingModel = await findAndValidateGradingModelId(gradingModelId);

  // Check that grading model belongs to the course.
  if (gradingModel.courseId !== course.id) {
    throw new ApiError(
      `Grading model with ID ${gradingModel.id} ` +
        `does not belong to the course with ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  return [course, gradingModel];
};
