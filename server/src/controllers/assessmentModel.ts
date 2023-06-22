// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';

import AssessmentModel from '../database/models/assessmentModel';
import Course from '../database/models/course';

import { AssessmentModelData } from '../types/attainment';
import { ApiError } from '../types/error';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';

import { findAssessmentModelById } from './utils/assessmentModel';
import { findCourseById } from './utils/course';

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
