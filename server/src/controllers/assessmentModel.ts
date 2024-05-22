// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ForeignKeyConstraintError, UniqueConstraintError} from 'sequelize';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AssessmentModelData,
  EditAssessmentModelDataSchema,
  HttpCode,
  NewAssessmentModelDataSchema,
} from '@/common/types';
import {
  checkAssessmentModelAttainments,
  validateAssessmentModelPath,
} from './utils/assessmentModel';
import {findAttainmentsByCourseId} from './utils/attainment';
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
  const [course, assessmentModel] = await validateAssessmentModelPath(
    req.params.courseId,
    req.params.assessmentModelId
  );
  const attainmentData = await findAttainmentsByCourseId(course.id);

  const assessmentModelData: AssessmentModelData = {
    id: assessmentModel.id,
    courseId: assessmentModel.courseId,
    name: assessmentModel.name,
    graphStructure: assessmentModel.graphStructure,
    archived: assessmentModel.archived,
    ...checkAssessmentModelAttainments(assessmentModel, attainmentData),
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
  const attainmentData = await findAttainmentsByCourseId(course.id);

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
      archived: assessmentModel.archived,
      ...checkAssessmentModelAttainments(assessmentModel, attainmentData),
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
      `Assessment model with name '${req.body.name}' already exists in course ID ${courseId}`,
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

  // Update assessment model & catch duplicate name error.
  try {
    await assessmentModel.update({
      name: req.body.name ?? assessmentModel.name,
      graphStructure: req.body.graphStructure ?? assessmentModel.graphStructure,
      archived: req.body.archived ?? assessmentModel.archived,
    });
  } catch (e) {
    // Duplicate name error
    if (e instanceof UniqueConstraintError) {
      throw new ApiError(
        'There cannot be two assessment models with the same name',
        HttpCode.Conflict
      );
    }

    // Other error
    throw e;
  }

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

  try {
    await assessmentModel.destroy();
  } catch (e) {
    // Catch deletion of assessment model with final grades
    if (
      e instanceof ForeignKeyConstraintError &&
      e.index === 'final_grade_assessment_model_id_fkey'
    ) {
      throw new ApiError(
        'Tried to delete assessment model with final grades',
        HttpCode.Conflict
      );
    }

    // Other error
    throw e;
  }

  res.sendStatus(HttpCode.Ok);
};
