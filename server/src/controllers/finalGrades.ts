// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';

import {FinalGradeData, HttpCode, NewFinalGrade} from '@common/types';
import FinalGrade from '../database/models/finalGrade';
import {JwtClaims} from '../types';
import {FinalGradeModelData} from '../types/finalGrade';
import {validateCourseId} from './utils/course';
import {isTeacherInChargeOrAdmin} from './utils/user';

export const addFinalGrades = async (
  req: Request<ParamsDictionary, unknown, NewFinalGrade[]>,
  res: Response
): Promise<void | Response> => {
  const grader = req.user as JwtClaims;

  const courseId = await validateCourseId(req.params.courseId);
  await isTeacherInChargeOrAdmin(grader, courseId);

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

/**
 * Responds with FinalGradeData[]
 */
export const getFinalGrades = async (
  req: Request,
  res: Response
): Promise<void | Response> => {
  const courseId = await validateCourseId(req.params.courseId);
  const grader = req.user as JwtClaims;

  await isTeacherInChargeOrAdmin(grader, courseId);

  const finalGrades: FinalGradeData[] = (
    await FinalGrade.findAll({
      where: {courseId: courseId},
    })
  ).map(finalGrade => ({
    ...finalGrade.dataValues,
    date: new Date(finalGrade.dataValues.date),
  }));

  return res.json(finalGrades);
};
