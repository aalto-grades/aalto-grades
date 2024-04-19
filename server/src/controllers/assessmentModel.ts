// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';

import {
  AssessmentModelData,
  EditAssessmentModelDataSchema,
  HttpCode,
  NewAssessmentModelDataSchema,
} from '@common/types';
import {GraphStructure} from '@common/types/graph';
import {TypedRequestBody} from 'zod-express-middleware';
import AssessmentModel from '../database/models/assessmentModel';
import {ApiError, JwtClaims} from '../types';
import {validateAssessmentModelPath} from './utils/assessmentModel';
import {findAndValidateCourseId} from './utils/course';
import {isTeacherInChargeOrAdmin} from './utils/user';

/**
 * Responds with AssessmentModelData
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
    graphStructure: assessmentModel.graphStructure as object as GraphStructure,
  };

  res.json(assessmentModelData);
};

/**
 * Responds with AssessmentModelData[]
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
      graphStructure:
        assessmentModel.graphStructure as object as GraphStructure,
    });
  }

  res.json(assessmentModelsData);
};

/**
 * Responds with number
 */
export const addAssessmentModel = async (
  req: TypedRequestBody<typeof NewAssessmentModelDataSchema>,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);

  // Route is only available for admins and those who have teacher in charge role for the course.
  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  // Find or create new assessment model based on name and course ID.
  const [assessmentModel, created] = await AssessmentModel.findOrCreate({
    where: {
      name: req.body.name,
      courseId: course.id,
    },
    defaults: {
      name: req.body.name,
      graphStructure: req.body.graphStructure as unknown as JSON,
    },
  });

  if (!created) {
    throw new ApiError(
      `Assessment model with name '${req.params.name}' already exists in course ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  res.status(HttpCode.Created).json(assessmentModel.id);
};

export const updateAssessmentModel = async (
  req: TypedRequestBody<typeof EditAssessmentModelDataSchema>,
  res: Response
): Promise<void> => {
  const [course, assessmentModel] = await validateAssessmentModelPath(
    req.params.courseId,
    req.params.assessmentModelId
  );

  // Route is only available for admins and those who have teacher in charge role for the course.
  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  // Update assessment model name.
  await assessmentModel.update({
    name: req.body.name ?? assessmentModel.name,
    graphStructure:
      req.body.graphStructure === undefined
        ? assessmentModel.graphStructure
        : (req.body.graphStructure as unknown as JSON),
  });

  res.sendStatus(HttpCode.Ok);
};

export const deleteAssessmentModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [course, assessmentModel] = await validateAssessmentModelPath(
    req.params.courseId,
    req.params.assessmentModelId
  );
  // Route is only available for admins and those who have teacher in charge role for the course.
  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  if (assessmentModel.courseId !== course.id) {
    throw new ApiError(
      `Assessment model with ID ${assessmentModel.id} does not belong to course ID ${course.id}`,
      HttpCode.Conflict
    );
  }

  // Delete assessment model.
  await assessmentModel.destroy();

  res.sendStatus(HttpCode.Ok);
};
