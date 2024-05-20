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

/** @throws ApiError(400|404|409) */
export const addFinalGrades = async (
  req: TypedRequestBody<typeof NewFinalGradeArraySchema>,
  res: Response
): Promise<void | Response> => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);

  // Validate that assessment models belong to the course
  const assessmentModels = new Set<number>();
  for (const fgrade of req.body) {
    if (fgrade.assessmentModelId !== null)
      assessmentModels.add(fgrade.assessmentModelId);
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
  const [_, fGrade] = await findAndValidateFinalGradePath(
    req.params.courseId,
    req.params.fGradeId
  );

  const {grade, date, sisuExportDate} = req.body;

  // If final grade is not not manual don't allow editing grade/date
  if (
    fGrade.assessmentModelId !== null &&
    ((grade !== undefined && grade !== fGrade.grade) ||
      (date !== undefined &&
        date.getTime() !== new Date(fGrade.date).getTime()))
  ) {
    throw new ApiError(
      'Cannot edit grade or date of a non-manual final grade',
      HttpCode.BadRequest
    );
  }

  await fGrade
    .set({
      grade: grade ?? fGrade.grade,
      date: date ?? fGrade.date,
      sisuExportDate:
        sisuExportDate !== undefined ? sisuExportDate : fGrade.sisuExportDate,
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
  const [_, fGrade] = await findAndValidateFinalGradePath(
    req.params.courseId,
    req.params.fGradeId
  );

  await fGrade.destroy();

  res.sendStatus(HttpCode.Ok);
};
