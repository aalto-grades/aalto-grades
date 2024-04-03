// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {z} from 'zod';

import {HttpCode} from '@common/types';
import FinalGrade from '../database/models/finalGrade';
import {JwtClaims} from '../types';
import {FinalGradeModelData} from '../types/finalGrade';
import {validateCourseId} from './utils/course';
import {isTeacherInChargeOrAdmin} from './utils/user';

// TODO: use zod in global type definition
export const addFinalGradesBodySchema = z.object({
  finalGrades: z.array(
    z.object({
      userId: z.number().int(),
      assessmentModelId: z.number().int(),
      grade: z.number().int().min(0).max(5),
      date: z.string().datetime().optional(),
    })
  ),
});
type addFinalGradesBody = z.infer<typeof addFinalGradesBodySchema>;

export const addFinalGrades = async (
  req: Request<ParamsDictionary, unknown, addFinalGradesBody>,
  res: Response
): Promise<void | Response> => {
  const newGrades = req.body.finalGrades;
  const grader = req.user as JwtClaims;

  const courseId = await validateCourseId(req.params.courseId);
  await isTeacherInChargeOrAdmin(grader, courseId);

  const preparedBulkCreate: FinalGradeModelData[] = newGrades.map(
    gradeEntry => ({
      userId: gradeEntry.userId,
      assessmentModelId: gradeEntry.assessmentModelId,
      courseId: courseId,
      graderId: grader.id,
      date:
        gradeEntry.date !== undefined ? new Date(gradeEntry.date) : undefined,
      grade: gradeEntry.grade,
    })
  );

  // TODO: Optimize if datasets are big.
  await FinalGrade.bulkCreate(preparedBulkCreate);

  // After this point all the students' attainment grades have been created
  return res.status(HttpCode.Ok).json({data: {}});
};

export const getFinalGrades = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  const courseId = await validateCourseId(req.params.courseId);
  const grader = req.user as JwtClaims;

  await isTeacherInChargeOrAdmin(grader, courseId);

  const finalGrades = await FinalGrade.findAll({
    where: {courseId: courseId},
  });

  return res.status(HttpCode.Ok).json({data: finalGrades});
};
