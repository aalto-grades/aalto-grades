// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {Request, Response} from 'express';

import {
  FinalGradeData,
  HttpCode,
  NewFinalGradeArraySchema,
} from '@common/types';
import {TypedRequestBody} from 'zod-express-middleware';
import FinalGrade from '../database/models/finalGrade';
import {JwtClaims} from '../types';
import {FinalGradeModelData} from '../types/finalGrade';
import {validateCourseId} from './utils/course';

/**
 * Responds with FinalGradeData[]
 *
 * @throws ApiError(400|404)
 */
export const getFinalGrades = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  const courseId = await validateCourseId(req.params.courseId);

  const dbFinalGrades = await FinalGrade.findAll({where: {courseId: courseId}});

  const finalGrades: FinalGradeData[] = dbFinalGrades.map(finalGrade => ({
    finalGradeId: finalGrade.id,
    userId: finalGrade.userId,
    courseId: finalGrade.courseId,
    assessmentModelId: finalGrade.assessmentModelId,
    graderId: finalGrade.graderId,
    grade: finalGrade.grade,
    date: new Date(finalGrade.date),
    sisuExportDate:
      finalGrade.sisuExportDate === null
        ? null
        : new Date(finalGrade.sisuExportDate),
  }));

  return res.json(finalGrades);
};

/** @throws ApiError(400|404) */
export const addFinalGrades = async (
  req: TypedRequestBody<typeof NewFinalGradeArraySchema>,
  res: Response
): Promise<void | Response> => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);

  const preparedBulkCreate: FinalGradeModelData[] = req.body.map(
    gradeEntry => ({
      userId: gradeEntry.userId,
      assessmentModelId: gradeEntry.assessmentModelId,
      courseId: courseId,
      graderId: grader.id,
      date: gradeEntry.date,
      grade: gradeEntry.grade,
    })
  );

  // TODO: Optimize if datasets are big.
  await FinalGrade.bulkCreate(preparedBulkCreate);

  return res.sendStatus(HttpCode.Created);
};
