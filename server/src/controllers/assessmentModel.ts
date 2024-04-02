// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {z} from 'zod';

import {AssessmentModelData, HttpCode} from '@common/types';
import {GraphStructure} from '@common/types/graph';
import AssessmentModel from '../database/models/assessmentModel';
import {ApiError, JwtClaims} from '../types';
import {validateAssessmentModelPath} from './utils/assessmentModel';
import {findAndValidateCourseId} from './utils/course';
import {isTeacherInChargeOrAdmin} from './utils/user';

export const getAssessmentModel = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [_course, assessmentModel] = await validateAssessmentModelPath(
    req.params.courseId,
    req.params.assesmentModelId
  );

  const assessmentModelData: AssessmentModelData = {
    id: assessmentModel.id,
    courseId: assessmentModel.courseId,
    name: assessmentModel.name,
    graphStructure: assessmentModel.graphStructure as object as GraphStructure,
  };

  res.status(HttpCode.Ok).json({data: assessmentModelData});
};

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

  res.status(HttpCode.Ok).json({data: assessmentModelsData});
};

export const addAssesmentModelBodySchema = z.object({
  name: z.string(),
  graphStructure: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    nodeData: z.array(z.any()),
  }), // TODO: improve
});
export type AddAssesmentModelBody = z.infer<typeof addAssesmentModelBodySchema>;

export const addAssessmentModel = async (
  req: Request<ParamsDictionary, unknown, AddAssesmentModelBody>,
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

  res.status(HttpCode.Ok).json({data: assessmentModel.id});
};

export const updateAssesmentModelBodySchema = z.object({
  name: z.string(),
  graphStructure: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    nodeData: z.array(z.any()),
  }), // TODO: improve
});
export type UpdateAssesmentModelBody = z.infer<
  typeof updateAssesmentModelBodySchema
>;

export const updateAssessmentModel = async (
  req: Request<ParamsDictionary, unknown, UpdateAssesmentModelBody>,
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
    name: req.body.name,
    graphStructure: req.body.graphStructure as unknown as JSON,
  });

  res.status(HttpCode.Ok).json({
    data: {
      id: assessmentModel.id,
      courseId: course.id,
      name: assessmentModel.name,
    },
  });
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

  // Delete assesment model.
  await assessmentModel.destroy();

  res.status(HttpCode.Ok).json({id: assessmentModel.id});
};
