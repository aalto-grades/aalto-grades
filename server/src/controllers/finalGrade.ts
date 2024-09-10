// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type EditFinalGrade,
  type FinalGradeData,
  GradingScale,
  HttpCode,
  type NewFinalGrade,
} from '@/common/types';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {
  ApiError,
  type Endpoint,
  type JwtClaims,
  type NewDbFinalGradeData,
} from '../types';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {findAndValidateFinalGradePath} from './utils/finalGrade';
import {validateGradingModelBelongsToCourse} from './utils/gradingModel';
import {validateUserAndGrader} from './utils/taskGrade';

/**
 * () => FinalGradeData[]
 *
 * @throws ApiError(400|404)
 */
export const getFinalGrades: Endpoint<void, FinalGradeData[]> = async (
  req,
  res
) => {
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

  const finalGrades = [];
  for (const finalGrade of dbFinalGrades) {
    const [user, grader] = validateUserAndGrader(finalGrade);
    finalGrades.push({
      finalGradeId: finalGrade.id,
      user: user,
      courseId: finalGrade.courseId,
      gradingModelId: finalGrade.gradingModelId,
      grader: grader,
      grade: finalGrade.grade,
      date: new Date(finalGrade.date),
      sisuExportDate: finalGrade.sisuExportDate,
      comment: finalGrade.comment,
    });
  }

  return res.json(finalGrades);
};

/**
 * (NewFinalGrade[]) => void
 *
 * @throws ApiError(400|404|409)
 */
export const addFinalGrades: Endpoint<NewFinalGrade[], void> = async (
  req,
  res
) => {
  const grader = req.user as JwtClaims;
  const course = await findAndValidateCourseId(req.params.courseId);

  // Validate that grading models belong to the course
  const gradingModels = new Set<number>();
  for (const finalGrade of req.body) {
    if (finalGrade.gradingModelId !== null)
      gradingModels.add(finalGrade.gradingModelId);

    let maxGrade;
    switch (course.gradingScale) {
      case GradingScale.Numerical:
        maxGrade = 5;
        break;
      case GradingScale.PassFail:
        maxGrade = 1;
        break;
      case GradingScale.SecondNationalLanguage:
        maxGrade = 2;
        break;
    }
    if (finalGrade.grade > maxGrade) {
      throw new ApiError(
        `Invalid final grade ${finalGrade.grade}`,
        HttpCode.BadRequest
      );
    }
  }
  for (const modelId of gradingModels) {
    await validateGradingModelBelongsToCourse(course.id, modelId);
  }

  const preparedBulkCreate: NewDbFinalGradeData[] = req.body.map(
    finalGrade => ({
      userId: finalGrade.userId,
      gradingModelId: finalGrade.gradingModelId,
      courseId: course.id,
      graderId: grader.id,
      date: finalGrade.date,
      grade: finalGrade.grade,
      comment: finalGrade.comment,
    })
  );

  // TODO: Optimize if datasets are big.
  await FinalGrade.bulkCreate(preparedBulkCreate);

  return res.sendStatus(HttpCode.Created);
};

/**
 * (EditFinalGrade) => void
 *
 * @throws ApiError(400|404|409)
 */
export const editFinalGrade: Endpoint<EditFinalGrade, void> = async (
  req,
  res
) => {
  const grader = req.user as JwtClaims;
  const [, finalGrade] = await findAndValidateFinalGradePath(
    req.params.courseId,
    req.params.finalGradeId
  );

  const {grade, date, sisuExportDate, comment} = req.body;

  // If final grade is not manual don't allow editing grade/date
  if (
    finalGrade.gradingModelId !== null &&
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
      comment: comment !== undefined ? comment : finalGrade.comment,
    })
    .save();

  res.sendStatus(HttpCode.Ok);
};

/**
 * () => void
 *
 * @throws ApiError(400|404|409)
 */
export const deleteFinalGrade: Endpoint<void, void> = async (req, res) => {
  const [, finalGrade] = await findAndValidateFinalGradePath(
    req.params.courseId,
    req.params.finalGradeId
  );

  await finalGrade.destroy();

  res.sendStatus(HttpCode.Ok);
};
