// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {stringify} from 'csv-stringify';

import {
  type EditFinalGrade,
  type FinalGradeData,
  GradingScale,
  HttpCode,
  type NewFinalGrade,
  type SisuCsvUpload,
} from '@/common/types';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {
  ApiError,
  type Endpoint,
  type JwtClaims,
  type NewDbFinalGradeData,
  type SisuCsvFormat,
} from '../types';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {
  findAndValidateFinalGradePath,
  getFinalGradesFor,
  sisuPreferFinalGrade,
  studentNumbersExist,
} from './utils/finalGrade';
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
      id: finalGrade.id,
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

/**
 * Get grading data formatted to Sisu compatible format for exporting grades to
 * Sisu. Documentation and requirements for Sisu CSV file structure available at
 * https://wiki.aalto.fi/display/SISEN/Assessment+of+implementations
 *
 * (SisuCsvUpload) => string (text/csv)
 *
 * @throws ApiError(400|404)
 */
export const getSisuFormattedGradingCSV: Endpoint<
  SisuCsvUpload,
  string
> = async (req, res) => {
  const course = await findAndValidateCourseId(req.params.courseId);
  await studentNumbersExist(req.body.studentNumbers);

  const allFinalGrades = await getFinalGradesFor(
    course.id,
    req.body.studentNumbers
  );

  // Group final grades by student number
  const studentFinalGrades: {[key: string]: FinalGradeData[]} = {};
  for (const finalGrade of allFinalGrades) {
    const studentNumber = finalGrade.user.studentNumber;
    if (!(studentNumber in studentFinalGrades))
      studentFinalGrades[studentNumber] = [];
    studentFinalGrades[studentNumber].push(finalGrade);
  }

  const sisuData: SisuCsvFormat[] = [];
  const exportedToSisu: number[] = [];

  for (const [studentNumber, finalGrades] of Object.entries(
    studentFinalGrades
  )) {
    // Find best final grade
    let bestFinalGrade = finalGrades[0];
    for (const finalGrade of finalGrades) {
      if (sisuPreferFinalGrade(finalGrade, bestFinalGrade))
        bestFinalGrade = finalGrade;
    }

    // Assessment date must be in form dd.mm.yyyy.
    const assessmentDate = (
      req.body.assessmentDate ?? new Date(bestFinalGrade.date)
    ).toLocaleDateString('fi-FI');

    const completionLanguage = req.body.completionLanguage
      ? req.body.completionLanguage.toLowerCase()
      : course.languageOfInstruction.toLowerCase();

    let csvGrade;
    switch (course.gradingScale) {
      case GradingScale.Numerical:
        csvGrade = bestFinalGrade.grade.toString();
        break;
      case GradingScale.PassFail:
        csvGrade = bestFinalGrade.grade === 0 ? 'fail' : 'pass';
        break;
      case GradingScale.SecondNationalLanguage:
        if (bestFinalGrade.grade === 0) csvGrade = 'Fail';
        else if (bestFinalGrade.grade === 1) csvGrade = 'SAT';
        else csvGrade = 'G';
        break;
    }

    exportedToSisu.push(bestFinalGrade.id);
    sisuData.push({
      studentNumber: studentNumber,
      grade: csvGrade,
      credits: course.maxCredits,
      assessmentDate: assessmentDate,
      completionLanguage: completionLanguage,
      comment: bestFinalGrade.comment ?? '', // Comment column is required, but can be empty.
    });
  }

  await FinalGrade.update(
    {sisuExportDate: new Date()},
    {
      where: {id: exportedToSisu},
    }
  );

  stringify(
    sisuData,
    {
      header: true,
      delimiter: ',', // Accepted delimiters in Sisu are semicolon ; and comma ,
    },
    (_err, data) => {
      res
        .setHeader('Content-Type', 'text/csv')
        .attachment(
          `final_grades_course_${
            course.courseCode
          }_${new Date().toLocaleDateString('fi-FI')}.csv`
        )
        .send(data);
    }
  );
};
