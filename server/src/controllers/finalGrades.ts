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
import User from '../database/models/user';
import {JwtClaims, NewDbFinalGradeData} from '../types';
import {validateCourseId} from './utils/course';
import {validateUserAndGrader} from './utils/grades';

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

  const dbFinalGrades = await FinalGrade.findAll({
    where: {courseId: courseId},
    include: [
      {model: User, attributes: ['id', 'name', 'email', 'studentNumber']},
      {
        model: User,
        as: 'grader',
        attributes: ['id', 'name', 'email', 'studentNumber'],
      },
    ],
  });

  const finalGrades: FinalGradeData[] = [];
  for (const finalGrade of dbFinalGrades) {
    const [user, grader] = validateUserAndGrader(finalGrade);
    finalGrades.push({
      finalGradeId: finalGrade.id,
      user: user,
      courseId: finalGrade.courseId,
      assessmentModelId: finalGrade.assessmentModelId,
      grader: grader,
      grade: finalGrade.grade,
      date: new Date(finalGrade.date),
      sisuExportDate:
        finalGrade.sisuExportDate === null
          ? null
          : new Date(finalGrade.sisuExportDate),
    });
  }

  return res.json(finalGrades);
};

/** @throws ApiError(400|404) */
export const addFinalGrades = async (
  req: TypedRequestBody<typeof NewFinalGradeArraySchema>,
  res: Response
): Promise<void | Response> => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);

  const preparedBulkCreate: NewDbFinalGradeData[] = req.body.map(
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
