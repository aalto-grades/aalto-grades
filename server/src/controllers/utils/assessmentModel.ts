// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import AssessmentModel from '../../database/models/assessmentModel';
import Course from '../../database/models/course';

import { findCourseById } from './course';
import { ApiError, HttpCode, idSchema } from '../../types';

export async function findAssessmentModelById(
  assessmentModelId: number, errorCode: HttpCode
): Promise<AssessmentModel> {
  const assessmentModel: AssessmentModel | null = await AssessmentModel.findByPk(
    assessmentModelId
  );

  if (!assessmentModel) {
    throw new ApiError(`assessment model with ID ${assessmentModelId} not found`, errorCode);
  }
  return assessmentModel;
}

export async function validateAssessmentModelPath(
  courseId: unknown, assessmentModelId: unknown
): Promise<[Course, AssessmentModel]> {
  const courseIdValidated: number = (await idSchema.validate(
    { id: courseId }, { abortEarly: false }
  )).id;

  const assessmentModelIdValidated: number = (await idSchema.validate(
    { id: assessmentModelId }, { abortEarly: false }
  )).id;

  // Ensure that course exists.
  const course: Course = await findCourseById(
    courseIdValidated, HttpCode.NotFound
  );

  // Ensure that assessment model exists.
  const assessmentModel: AssessmentModel = await findAssessmentModelById(
    assessmentModelIdValidated, HttpCode.NotFound
  );

  // Check that assessment model belongs to the course.
  if (assessmentModel.courseId !== course.id) {
    throw new ApiError(
      `assessment model with ID ${assessmentModelId} ` +
      `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  return [course, assessmentModel];
}
