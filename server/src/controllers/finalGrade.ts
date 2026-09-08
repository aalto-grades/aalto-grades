// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {stringify} from 'csv-stringify';
import {Op} from 'sequelize';

import {
  type EditFinalGrade,
  type FinalGradeData,
  type FinalGradeFrozenInfo,
  type FrozenCoursePart,
  type FrozenGradingModel,
  type FrozenTaskGrade,
  GradingScale,
  type GraphStructure,
  HttpCode,
  type NewFinalGrade,
  type SisuCsvUpload,
  WaitListStatus,
} from '@/common/types';
import CoursePart from '../database/models/coursePart';
import CourseTask from '../database/models/courseTask';
import FinalGrade from '../database/models/finalGrade';
import GradingModel from '../database/models/gradingModel';
import TaskGrade from '../database/models/taskGrade';
import User from '../database/models/user';
import WaitListEntry from '../database/models/waitListEntry';
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
      frozenInfo: finalGrade.frozenInfo as FinalGradeFrozenInfo | null,
    });
  }

  return res.json(finalGrades);
};

const toIsoDate = (date: Date | string | null): string | null =>
  date === null ? null : new Date(date).toISOString();

const isExpired = (date: Date | null): boolean =>
  date !== null && Date.now() > date.getTime();

/** Whether a grade has expired, taking the expiry date of its course part into account */
const gradeIsExpired = (
  grade: TaskGrade,
  partExpiryDate: Date | null | undefined
): boolean => {
  if (grade.expiryDate !== null && !isExpired(new Date(grade.expiryDate)))
    return false;
  return (
    isExpired(grade.expiryDate === null ? null : new Date(grade.expiryDate))
    || isExpired(partExpiryDate ?? null)
  );
};

/** Whether a grade is better than another, newer grades winning ties */
const gradeIsBetter = (grade: TaskGrade, other: TaskGrade): boolean => {
  if (grade.grade !== other.grade) return grade.grade > other.grade;
  const date = new Date(grade.date).getTime();
  const otherDate = new Date(other.date).getTime();
  if (date !== otherDate) return date > otherDate;
  return grade.id > other.id;
};

/** Hard copy of a grading model */
const freezeGradingModel = (
  model: GradingModel
): FrozenGradingModel => ({
  id: model.id,
  name: model.name,
  graphStructure: model.graphStructure,
});

/** Ids of the sources (course parts or tasks) feeding a grading graph */
const graphSourceIds = (graphStructure: GraphStructure): number[] =>
  graphStructure.nodes
    .filter(node => node.type === 'source')
    .map(node => Number.parseInt(node.id.split('-')[1] ?? '', 10))
    .filter(id => !Number.isNaN(id));

/**
 * Builds the frozen snapshot of grading data for a set of students.
 * The snapshot contains hard copies of the grading model, the course parts it
 * uses with their grading models, and the tasks with each student's grades, so
 * the data stays intact even if models or tasks change later. Parts, tasks and
 * grades not used by the model are left out.
 */
const buildFrozenInfos = async (
  courseId: number,
  userIds: number[],
  gradingModel: GradingModel
): Promise<Map<number, FinalGradeFrozenInfo>> => {
  const sources = graphSourceIds(gradingModel.graphStructure);
  // A final grade model takes course parts as sources, a course part model
  // takes the tasks of a single part
  const partIds = gradingModel.coursePartId === null
    ? sources
    : [gradingModel.coursePartId];

  const courseParts = await CoursePart.findAll({
    where: {id: partIds},
  });
  const partModels = await GradingModel.findAll({
    where: {coursePartId: partIds},
  });
  const courseTasks = await CourseTask.findAll({
    where:
      gradingModel.coursePartId === null
        ? {
            id: partModels.flatMap(model =>
              graphSourceIds(model.graphStructure)
            ),
          }
        : {id: sources},
  });

  const modelsByPart = new Map<number, FrozenGradingModel>(
    partModels.map(model => [
      model.coursePartId as number,
      freezeGradingModel(model),
    ])
  );

  const frozenCourseParts: FrozenCoursePart[] = courseParts
    .map(part => ({
      id: part.id,
      name: part.name,
      expiryDate: toIsoDate(part.expiryDate),
      gradingModel: modelsByPart.get(part.id) ?? null,
    }))
    .sort((a, b) => a.id - b.id);

  const taskGrades = await TaskGrade.findAll({
    where: {
      userId: {[Op.in]: userIds},
      courseTaskId: courseTasks.map(task => task.id),
    },
    order: [['id', 'ASC']],
  });

  const taskById = new Map(courseTasks.map(task => [task.id, task]));
  const expiryDateByPart = new Map(
    courseParts.map(part => [
      part.id,
      part.expiryDate === null ? null : new Date(part.expiryDate),
    ])
  );
  // Only the grade actually used by the calculation is worth keeping
  const usedGrades = new Map<string, TaskGrade>();
  for (const taskGrade of taskGrades) {
    const partExpiryDate = expiryDateByPart.get(
      taskById.get(taskGrade.courseTaskId)?.coursePartId ?? -1
    );
    if (gradeIsExpired(taskGrade, partExpiryDate)) continue;
    const key = `${taskGrade.userId}:${taskGrade.courseTaskId}`;
    const previous = usedGrades.get(key);
    if (previous === undefined || gradeIsBetter(taskGrade, previous))
      usedGrades.set(key, taskGrade);
  }

  const gradesByTaskUser = new Map<string, FrozenTaskGrade[]>();
  for (const [key, taskGrade] of usedGrades) {
    gradesByTaskUser.set(key, [
      {
        grade: taskGrade.grade,
        date: toIsoDate(taskGrade.date) as string,
        expiryDate: toIsoDate(taskGrade.expiryDate) as string | null,
      },
    ]);
  }

  return new Map(
    userIds.map(userId => [
      userId,
      {
        gradingModel: freezeGradingModel(gradingModel),
        courseParts: frozenCourseParts,
        tasks: courseTasks
          .map(task => ({
            id: task.id,
            coursePartId: task.coursePartId,
            name: task.name,
            daysValid: task.daysValid,
            maxGrade: task.maxGrade,
            grades: gradesByTaskUser.get(`${userId}:${task.id}`) ?? [],
          }))
          .filter(task => task.grades.length > 0)
          .sort((a, b) => a.id - b.id),
      },
    ])
  );
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
  const userIds = req.body.map(finalGrade => finalGrade.userId);
  // Waitlist check
  const pendingEntries = await WaitListEntry.findAll({
    where: {
      courseId: course.id,
      userId: {[Op.in]: userIds},
      status: WaitListStatus.Pending,
    },
    include: [{model: User, attributes: ['studentNumber']}],
  });

  if (pendingEntries.length > 0) {
    const blockedStudentNumbers = pendingEntries
      .map(entry => entry.User?.studentNumber)
      .filter((value): value is string => value !== null && value !== undefined);
    throw new ApiError(
      `Final grades cannot be calculated while students are pending investigation: ${blockedStudentNumbers.join(', ')}`,
      HttpCode.Conflict
    );
  }

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
  const modelsById = new Map<number, GradingModel>();
  for (const modelId of gradingModels) {
    const [, model] = await validateGradingModelBelongsToCourse(course.id, modelId);
    modelsById.set(modelId, model);
  }

  // Snapshot the grading data used for the final grades. Manual grades have
  // no model and thus nothing to snapshot
  const frozenInfos = new Map<string, FinalGradeFrozenInfo>();
  const userIdsByModel = new Map<number, number[]>();
  for (const finalGrade of req.body) {
    if (finalGrade.gradingModelId === null) continue;
    if (!userIdsByModel.has(finalGrade.gradingModelId))
      userIdsByModel.set(finalGrade.gradingModelId, []);
    userIdsByModel.get(finalGrade.gradingModelId)?.push(finalGrade.userId);
  }
  for (const [modelId, userIdsForModel] of userIdsByModel) {
    const model = modelsById.get(modelId);
    if (model === undefined) continue;
    const infos = await buildFrozenInfos(course.id, userIdsForModel, model);
    for (const [userId, info] of infos) frozenInfos.set(`${userId}:${modelId}`, info);
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
      frozenInfo: frozenInfos.get(`${finalGrade.userId}:${finalGrade.gradingModelId ?? null}`) ?? null,
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
    finalGrade.gradingModelId !== null
    && ((grade !== undefined && grade !== finalGrade.grade)
      || (date !== undefined
        && date.getTime() !== new Date(finalGrade.date).getTime()))
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
      quoted: true, // fix for SISU
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
