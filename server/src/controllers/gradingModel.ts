// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ForeignKeyConstraintError, UniqueConstraintError} from 'sequelize';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  GradingModelData,
  EditGradingModelDataSchema,
  HttpCode,
  NewGradingModelDataSchema,
} from '@/common/types';
import {findCoursePartByCourseId} from './utils/attainment';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {
  checkGradingModelCourseParts,
  validateGradingModelPath,
} from './utils/gradingModel';
import GradingModel from '../database/models/gradingModel';
import {ApiError} from '../types';

/**
 * Responds with GradingModelData
 *
 * @throws ApiError(400|404|409)
 */
export const getGradingModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [course, gradingModel] = await validateGradingModelPath(
    req.params.courseId,
    req.params.gradingModelId
  );
  const coursePartData = await findCoursePartByCourseId(course.id);

  const gradingModelData: GradingModelData = {
    id: gradingModel.id,
    courseId: gradingModel.courseId,
    name: gradingModel.name,
    graphStructure: gradingModel.graphStructure,
    archived: gradingModel.archived,
    ...checkGradingModelCourseParts(gradingModel, coursePartData),
  };

  res.json(gradingModelData);
};

/**
 * Responds with GradingModelData[]
 *
 * @throws ApiError(400|404)
 */
export const getAllGradingModels = async (
  req: Request,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);
  const coursePartData = await findCoursePartByCourseId(course.id);

  const gradingModels = await GradingModel.findAll({
    where: {courseId: course.id},
  });

  const gradingModelsData: GradingModelData[] = [];

  for (const gradingModel of gradingModels) {
    gradingModelsData.push({
      id: gradingModel.id,
      courseId: gradingModel.courseId,
      name: gradingModel.name,
      graphStructure: gradingModel.graphStructure,
      archived: gradingModel.archived,
      ...checkGradingModelCourseParts(gradingModel, coursePartData),
    });
  }

  res.json(gradingModelsData);
};

/**
 * Responds with number
 *
 * @throws ApiError(400|404|409)
 */
export const addGradingModel = async (
  req: TypedRequestBody<typeof NewGradingModelDataSchema>,
  res: Response
): Promise<void> => {
  const courseId = await validateCourseId(req.params.courseId);

  // Find or create new grading model based on name and course ID.
  const [gradingModel, created] = await GradingModel.findOrCreate({
    where: {
      name: req.body.name,
      courseId: courseId,
    },
    defaults: {
      name: req.body.name,
      graphStructure: req.body.graphStructure,
    },
  });

  if (!created) {
    throw new ApiError(
      `Grading model with name '${req.body.name}' already exists in course ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  res.status(HttpCode.Created).json(gradingModel.id);
};

/** @throws ApiError(400|404|409) */
export const editGradingModel = async (
  req: TypedRequestBody<typeof EditGradingModelDataSchema>,
  res: Response
): Promise<void> => {
  const [, gradingModel] = await validateGradingModelPath(
    req.params.courseId,
    req.params.gradingModelId
  );

  // Update grading model & catch duplicate name error.
  try {
    await gradingModel.update({
      name: req.body.name ?? gradingModel.name,
      graphStructure: req.body.graphStructure ?? gradingModel.graphStructure,
      archived: req.body.archived ?? gradingModel.archived,
    });
  } catch (e) {
    // Duplicate name error
    if (e instanceof UniqueConstraintError) {
      throw new ApiError(
        'There cannot be two grading models with the same name',
        HttpCode.Conflict
      );
    }

    // Other error
    throw e;
  }

  res.sendStatus(HttpCode.Ok);
};

/** @throws ApiError(400|404|409) */
export const deleteGradingModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [, gradingModel] = await validateGradingModelPath(
    req.params.courseId,
    req.params.gradingModelId
  );

  try {
    await gradingModel.destroy();
  } catch (e) {
    // Catch deletion of grading model with final grades
    if (
      e instanceof ForeignKeyConstraintError &&
      e.index === 'final_grade_grading_model_id_fkey'
    ) {
      throw new ApiError(
        'Tried to delete grading model with final grades',
        HttpCode.Conflict
      );
    }

    // Other error
    throw e;
  }

  res.sendStatus(HttpCode.Ok);
};
