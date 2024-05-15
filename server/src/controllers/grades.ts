// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {stringify} from 'csv-stringify';
import {Request, Response} from 'express';
import {Op} from 'sequelize';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  EditGradeDataSchema,
  FinalGradeData,
  GradeData,
  HttpCode,
  NewGradeArraySchema,
  SisuCsvUploadSchema,
  StudentRow,
  UserData,
} from '@/common/types';
import {validateAttainmentBelongsToCourse} from './utils/attainment';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {
  findAndValidateAttainmentGradePath,
  getDateOfLatestGrade,
  getFinalGradesFor,
  studentNumbersExist,
  validateUserAndGrader,
} from './utils/grades';
import logger from '../configs/winston';
import {sequelize} from '../database';
import Attainment from '../database/models/attainment';
import AttainmentGrade from '../database/models/attainmentGrade';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {ApiError, JwtClaims, NewDbGradeData} from '../types';

/**
 * Responds with StudentRow[]
 *
 * @throws ApiError(400|404)
 */
export const getGrades = async (req: Request, res: Response): Promise<void> => {
  const courseId = await validateCourseId(req.params.courseId);

  // Get all attainments for the course
  const attainments = await Attainment.findAll({
    where: {courseId: courseId},
  });

  // Get grades of all attainments
  const grades = await AttainmentGrade.findAll({
    include: [
      {model: User, attributes: ['id', 'name', 'email', 'studentNumber']},
      {
        model: User,
        as: 'grader',
        attributes: ['id', 'name', 'email', 'studentNumber'],
      },
    ],
    where: {
      attainmentId: {
        [Op.in]: attainments.map(attainment => attainment.id),
      },
    },
  });

  // Get finalGrades for all students
  const finalGrades = await FinalGrade.findAll({
    include: [
      {model: User, attributes: ['id', 'name', 'email', 'studentNumber']},
      {
        model: User,
        as: 'grader',
        attributes: ['id', 'name', 'email', 'studentNumber'],
      },
    ],
    where: {courseId: courseId},
  });

  // User dict of unique users {userId: User, ...}
  const usersDict: {[key: string]: UserData & {studentNumber: string}} = {};

  // Grades dict {userId: {attId: GradeData[], ...}, ...}
  const userGrades: {[key: string]: {[key: string]: GradeData[]}} = {};

  for (const grade of grades) {
    const [user, grader] = validateUserAndGrader(grade);

    if (!(user.id in usersDict)) {
      usersDict[user.id] = {
        ...user.dataValues,
        studentNumber: user.studentNumber,
      };
    }

    const userId = grade.userId;
    if (!(userId in userGrades)) userGrades[userId] = {};
    if (!(grade.attainmentId in userGrades[userId]))
      userGrades[userId][grade.attainmentId] = [];

    userGrades[userId][grade.attainmentId].push({
      gradeId: grade.id,
      grader: grader,
      grade: grade.grade,
      exportedToSisu: grade.sisuExportDate,
      date: new Date(grade.date),
      expiryDate: new Date(grade.expiryDate),
      comment: grade.comment,
    });
  }

  // FinalGrades dict {userId: FinalGradeData[], ...}
  const finalGradesDict: {[key: string]: FinalGradeData[]} = {};
  for (const fGrade of finalGrades) {
    const [user, grader] = validateUserAndGrader(fGrade);

    const userId = user.id;
    if (!(userId in finalGradesDict)) finalGradesDict[userId] = [];

    finalGradesDict[userId].push({
      finalGradeId: fGrade.id,
      user: user,
      courseId: fGrade.courseId,
      assessmentModelId: fGrade.assessmentModelId,
      grader: grader,
      grade: fGrade.grade,
      date: new Date(fGrade.date),
      sisuExportDate: fGrade.sisuExportDate,
    });
  }

  const result: StudentRow[] = Object.keys(userGrades).map(
    (userId): StudentRow => ({
      user: usersDict[userId],
      finalGrades: finalGradesDict[userId],
      attainments: attainments.map(attainment => ({
        attainmentId: attainment.id,
        attainmentName: attainment.name,
        grades:
          (userGrades[userId][attainment.id] as GradeData[] | undefined) ?? [],
      })),
    })
  );

  res.json(result);
};

/** @throws ApiError(400|404|409) */
export const addGrades = async (
  req: TypedRequestBody<typeof NewGradeArraySchema>,
  res: Response
): Promise<Response | void> => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);

  // Validate that attainments belong to correct course
  const attainmentIds = new Set<number>();
  for (const grade of req.body) attainmentIds.add(grade.attainmentId);
  for (const gradeId of attainmentIds) {
    await validateAttainmentBelongsToCourse(courseId, gradeId);
  }

  // Check all users (students) exists in db, create new users if needed.
  // Make sure each studentNumber is only in the list once
  const studentNumbers = Array.from(
    new Set(req.body.map(grade => grade.studentNumber))
  );

  let students = (await User.findAll({
    attributes: ['id', 'studentNumber'],
    where: {
      studentNumber: {[Op.in]: studentNumbers},
    },
  })) as (UserData & {studentNumber: string})[];
  const foundStudents = students.map(student => student.studentNumber);
  const nonExistingStudents = studentNumbers.filter(
    id => !foundStudents.includes(id)
  );

  await sequelize.transaction(async t => {
    if (nonExistingStudents.length === 0) return;

    // Create new users (students) from the CSV.
    const newUsers = (await User.bulkCreate(
      nonExistingStudents.map(studentNumber => ({
        studentNumber: studentNumber,
      })),
      {transaction: t}
    )) as (UserData & {studentNumber: string})[];
    students = students.concat(newUsers);
  });

  // All students now exists in the database.
  students = (await User.findAll({
    attributes: ['id', 'studentNumber'],
    where: {
      studentNumber: {
        [Op.in]: studentNumbers,
      },
    },
  })) as (UserData & {studentNumber: string})[];

  const studentNumberToId = Object.fromEntries(
    students.map(student => [student.studentNumber, student.id])
  );

  // Use studentsWithId to update attainments by flatmapping each
  // students grades into a one array of all the grades.
  const preparedBulkCreate: NewDbGradeData[] = req.body.map(gradeEntry => ({
    userId: studentNumberToId[gradeEntry.studentNumber],
    attainmentId: gradeEntry.attainmentId,
    graderId: grader.id,
    date: gradeEntry.date,
    expiryDate: gradeEntry.expiryDate,
    grade: gradeEntry.grade,
  }));

  // TODO: Optimize if datasets are big.
  await AttainmentGrade.bulkCreate(preparedBulkCreate);

  // After this point all the students' attainment grades have been created
  return res.sendStatus(HttpCode.Created);
};

/** @throws ApiError(400|404|409) */
export const editGrade = async (
  req: TypedRequestBody<typeof EditGradeDataSchema>,
  res: Response
): Promise<void> => {
  const grader = req.user as JwtClaims;
  const [_, gradeData] = await findAndValidateAttainmentGradePath(
    req.params.courseId,
    req.params.gradeId
  );

  const {grade, date, expiryDate, comment} = req.body;

  if (
    date !== undefined &&
    expiryDate === undefined &&
    date > new Date(gradeData.expiryDate)
  ) {
    throw new ApiError(
      `New date (${date.toString()}) can't be later than` +
        ` existing expiration date (${gradeData.expiryDate.toString()})`,
      HttpCode.BadRequest
    );
  } else if (
    expiryDate !== undefined &&
    date === undefined &&
    new Date(gradeData.date) > expiryDate
  ) {
    throw new ApiError(
      `New expiration date (${expiryDate.toString()}) can't be before` +
        ` existing date (${gradeData.date.toString()})`,
      HttpCode.BadRequest
    );
  }

  await gradeData
    .set({
      grade: grade ?? gradeData.grade,
      date: date ?? gradeData.date,
      expiryDate: expiryDate ?? gradeData.expiryDate,
      comment: comment !== undefined ? comment : gradeData.comment,
      graderId: grader.id,
    })
    .save();

  res.sendStatus(HttpCode.Ok);
};

/** @throws ApiError(400|404|409) */
export const deleteGrade = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [_, grade] = await findAndValidateAttainmentGradePath(
    req.params.courseId,
    req.params.gradeId
  );

  await grade.destroy();

  res.sendStatus(HttpCode.Ok);
};

/**
 * Get grading data formatted to Sisu compatible format for exporting grades to
 * Sisu. Documentation and requirements for Sisu CSV file structure available at
 * https://wiki.aalto.fi/display/SISEN/Assessment+of+implementations
 *
 * Responds with text/csv
 *
 * @throws ApiError(400|404)
 */
export const getSisuFormattedGradingCSV = async (
  req: TypedRequestBody<typeof SisuCsvUploadSchema>,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);
  await studentNumbersExist(req.body.studentNumbers);

  const sisuExportDate = new Date();

  // TODO: Only one grade per user per instance is allowed
  const finalGrades = await getFinalGradesFor(
    course.id,
    req.body.studentNumbers
  );

  type SisuCsvFormat = {
    studentNumber: string;
    grade: string;
    credits: number;
    assessmentDate: string;
    completionLanguage: string;
    comment: string;
  };

  type MarkSisuExport = {gradeId: number; userId: number};

  const courseResults: SisuCsvFormat[] = [];
  const exportedToSisu: MarkSisuExport[] = [];

  // TODO: Confirm that finalgrade.grade is valid
  for (const finalGrade of finalGrades) {
    if (finalGrade.User === undefined) {
      logger.error(
        `Final grade ${finalGrade.id} user was undefined even though student nubmers were validated`
      );
      throw new ApiError(
        'Final grade user was undefined',
        HttpCode.InternalServerError
      );
    }
    if (finalGrade.User.studentNumber === null) {
      logger.error(
        `Final grade ${finalGrade.id} user student number was null even though student nubmers were validated`
      );
      throw new ApiError(
        'Final grade user student number was null',
        HttpCode.InternalServerError
      );
    }

    const existingResult = courseResults.find(
      value => value.studentNumber === finalGrade.User?.studentNumber
    );

    if (existingResult) {
      // TODO: Maybe more options than just best grade
      if (finalGrade.grade <= parseInt(existingResult.grade)) continue;
      existingResult.grade = finalGrade.grade.toString();

      // There can be multiple grades, make sure only the exported grade is marked with timestamp.
      const userData = exportedToSisu.find(
        value => value.userId === finalGrade.User?.id
      );
      if (userData) userData.gradeId = finalGrade.id;
    } else {
      exportedToSisu.push({gradeId: finalGrade.id, userId: finalGrade.userId});

      // Assessment date must be in form dd.mm.yyyy.
      // HERE we want to find the latest completed attainment grade for student
      const assessmentDate = (
        req.body.assessmentDate
          ? req.body.assessmentDate
          : await getDateOfLatestGrade(finalGrade.userId, course.id)
      ).toLocaleDateString('fi-FI');

      const completionLanguage = req.body.completionLanguage
        ? req.body.completionLanguage.toLowerCase()
        : course.languageOfInstruction.toLowerCase();

      courseResults.push({
        studentNumber: finalGrade.User.studentNumber,
        grade: finalGrade.grade.toString(),
        credits: course.maxCredits,
        assessmentDate: assessmentDate,
        completionLanguage: completionLanguage,
        comment: finalGrade.comment ?? '', // Comment column is required, but can be empty.
      });
    }
  }

  await FinalGrade.update(
    {sisuExportDate},
    {
      where: {
        id: {
          [Op.or]: exportedToSisu.map(value => value.gradeId),
        },
      },
    }
  );

  stringify(
    courseResults,
    {
      header: true,
      delimiter: ',', // NOTE, accepted delimiters in Sisu are semicolon ; and comma ,
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
