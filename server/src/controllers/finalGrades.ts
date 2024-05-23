// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {Request, Response} from 'express';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  EditFinalGradeSchema,
  FinalGradeData,
  HttpCode,
  NewFinalGradeArraySchema,
} from '@/common/types';
import {validateAssessmentModelBelongsToCourse} from './utils/assessmentModel';
import {validateCourseId} from './utils/course';
import {findAndValidateFinalGradePath} from './utils/finalGrade';
import {validateUserAndGrader} from './utils/grades';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {ApiError, JwtClaims, NewDbFinalGradeData} from '../types';

/**
 * Responds with FinalGradeData[]
 *
 * @throws ApiError(400|404)
 */
export const getFinalGrades = async (
  req: Request,
  res: Response
): Promise<Response> => {
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

/** @throws ApiError(400|404|409) */
export const addFinalGrades = async (
  req: TypedRequestBody<typeof NewFinalGradeArraySchema>,
  res: Response
): Promise<Response> => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);

  // Validate that assessment models belong to the course
  const assessmentModels = new Set<number>();
  for (const finalGrade of req.body) {
    if (finalGrade.assessmentModelId !== null)
      assessmentModels.add(finalGrade.assessmentModelId);
  }
  for (const modelId of assessmentModels) {
    await validateAssessmentModelBelongsToCourse(courseId, modelId);
  }

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

/** @throws ApiError(400|404|409) */
export const editFinalGrade = async (
  req: TypedRequestBody<typeof EditFinalGradeSchema>,
  res: Response
): Promise<void> => {
  const grader = req.user as JwtClaims;
  const [, finalGrade] = await findAndValidateFinalGradePath(
    req.params.courseId,
    req.params.finalGradeId
  );

  const {grade, date, sisuExportDate} = req.body;

  // If final grade is not manual don't allow editing grade/date
  if (
    finalGrade.assessmentModelId !== null &&
    ((grade !== undefined && grade !== finalGrade.grade) ||
      (date !== undefined &&
        date.getTime() !== new Date(finalGrade.date).getTime()))
  ) {
    throw new ApiError(
      'Cannot edit grade or date of a non-manual final grade',
      HttpCode.BadRequest
    );
  }

  await finalGrade
    .set({
      grade: grade ?? finalGrade.grade,
      date: date ?? finalGrade.date,
      sisuExportDate:
        sisuExportDate !== undefined
          ? sisuExportDate
          : finalGrade.sisuExportDate,
      graderId: grader.id,
    })
    .save();

  res.sendStatus(HttpCode.Ok);
};

/** @throws ApiError(400|404|409) */
export const deleteFinalGrade = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [, finalGrade] = await findAndValidateFinalGradePath(
    req.params.courseId,
    req.params.finalGradeId
  );

  await finalGrade.destroy();

  res.sendStatus(HttpCode.Ok);
};
