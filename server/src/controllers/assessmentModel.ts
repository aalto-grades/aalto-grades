// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AssessmentModelData,
  EditAssessmentModelDataSchema,
  HttpCode,
  NewAssessmentModelDataSchema,
} from '@/common/types';
import {validateAssessmentModelPath} from './utils/assessmentModel';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import AssessmentModel from '../database/models/assessmentModel';
import {ApiError} from '../types';

/**
 * Responds with AssessmentModelData
 *
 * @throws ApiError(400|404|409)
 */
export const getAssessmentModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [_course, assessmentModel] = await validateAssessmentModelPath(
    req.params.courseId,
    req.params.assessmentModelId
  );

  const assessmentModelData: AssessmentModelData = {
    id: assessmentModel.id,
    courseId: assessmentModel.courseId,
    name: assessmentModel.name,
    graphStructure: assessmentModel.graphStructure,
  };

  res.json(assessmentModelData);
};

/**
 * Responds with AssessmentModelData[]
 *
 * @throws ApiError(400|404)
 */
export const getAllAssessmentModels = async (
  req: Request,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);

  const assessmentModels = await AssessmentModel.findAll({
    where: {courseId: course.id},
  });

  const assessmentModelsData: AssessmentModelData[] = [];

  for (const assessmentModel of assessmentModels) {
    assessmentModelsData.push({
      id: assessmentModel.id,
      courseId: assessmentModel.courseId,
      name: assessmentModel.name,
      graphStructure: assessmentModel.graphStructure,
    });
  }

  res.json(assessmentModelsData);
};

/**
 * Responds with number
 *
 * @throws ApiError(400|404|409)
 */
export const addAssessmentModel = async (
  req: TypedRequestBody<typeof NewAssessmentModelDataSchema>,
  res: Response
): Promise<void> => {
  const courseId = await validateCourseId(req.params.courseId);

  // Find or create new assessment model based on name and course ID.
  const [assessmentModel, created] = await AssessmentModel.findOrCreate({
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
      `Assessment model with name '${req.params.name}' already exists in course ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  res.status(HttpCode.Created).json(assessmentModel.id);
};

/** @throws ApiError(400|404|409) */
export const editAssessmentModel = async (
  req: TypedRequestBody<typeof EditAssessmentModelDataSchema>,
  res: Response
): Promise<void> => {
  const [_, assessmentModel] = await validateAssessmentModelPath(
    req.params.courseId,
    req.params.assessmentModelId
  );

  // Update assessment model name.
  await assessmentModel.update({
    name: req.body.name ?? assessmentModel.name,
    graphStructure:
      req.body.graphStructure === undefined
        ? assessmentModel.graphStructure
        : req.body.graphStructure,
  });

  res.sendStatus(HttpCode.Ok);
};

/** @throws ApiError(400|404|409) */
export const deleteAssessmentModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [_, assessmentModel] = await validateAssessmentModelPath(
    req.params.courseId,
    req.params.assessmentModelId
  );

  await assessmentModel.destroy(); // Delete assessment model.

  res.sendStatus(HttpCode.Ok);
};
