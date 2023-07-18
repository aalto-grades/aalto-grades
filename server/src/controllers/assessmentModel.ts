// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import AssessmentModel from '../database/models/assessmentModel';
import Course from '../database/models/course';

import { AssessmentModelData } from 'aalto-grades-common/types';
import { ApiError, HttpCode, idSchema, JwtClaims } from '../types';
import { findAssessmentModelById } from './utils/assessmentModel';
import { findCourseById } from './utils/course';
import { isTeacherInChargeOrAdmin } from './utils/user';

export async function getAssessmentModel(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const assessmentModelId: number = Number(req.params.assessmentModelId);
  await idSchema.validate({ id: assessmentModelId });

  const course: Course = await findCourseById(
    courseId, HttpCode.NotFound
  );

  const assessmentModel: AssessmentModel = await findAssessmentModelById(
    assessmentModelId, HttpCode.NotFound
  );

  if (assessmentModel.courseId !== course.id) {
    throw new ApiError(
      `assessment model with ID ${assessmentModelId} ` +
      `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  const assessmentModelData: AssessmentModelData = {
    id: assessmentModel.id,
    courseId: assessmentModel.courseId,
    name: assessmentModel.name
  };

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      assessmentModel: assessmentModelData
    }
  });
}

export async function getAllAssessmentModels(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const course: Course = await findCourseById(
    courseId, HttpCode.NotFound
  );

  const assessmentModels: Array<AssessmentModel> = await AssessmentModel.findAll({
    where: {
      courseId: course.id
    }
  });

  const assessmentModelsData: Array<AssessmentModelData> = [];

  for (const assessmentModel of assessmentModels) {
    assessmentModelsData.push({
      id: assessmentModel.id,
      courseId: assessmentModel.courseId,
      name: assessmentModel.name
    });
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      assessmentModels: assessmentModelsData
    }
  });
}

export async function addAssessmentModel(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    name: yup.string().strict().required()
  });

  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });
  await requestSchema.validate(req.body, { abortEarly: false });

  // Confirm that course exists.
  const course: Course = await findCourseById(
    courseId, HttpCode.NotFound
  );

  // Route is only available for admins and those who have teacher in charge role for the course.
  await isTeacherInChargeOrAdmin(req.user as JwtClaims, courseId, HttpCode.Forbidden);

  const newAssessmentModel: AssessmentModel = await AssessmentModel.create({
    courseId: course.id,
    name: req.body.name
  });

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      assessmentModel: {
        id: newAssessmentModel.id
      }
    }
  });
}
