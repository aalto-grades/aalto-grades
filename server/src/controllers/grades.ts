// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {stringify} from 'csv-stringify';
import {Request, Response} from 'express';
import {Op} from 'sequelize';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditGradeDataSchema,
  FinalGradeData,
  GradeData,
  GradingScale,
  HttpCode,
  NewGradeArraySchema,
  SisuCsvUploadSchema,
  StudentRow,
  UserData,
} from '@/common/types';
import {validateAplusGradeSourceBelongsToCoursePart} from './utils/aplus';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {validateCoursePartBelongsToCourse} from './utils/coursePart';
import {
  findAndValidateGradePath,
  getDateOfLatestGrade,
  getFinalGradesFor,
  studentNumbersExist,
  validateUserAndGrader,
} from './utils/grades';
import logger from '../configs/winston';
import {sequelize} from '../database';
import AttainmentGrade from '../database/models/attainmentGrade';
import CoursePart from '../database/models/coursePart';
import CourseRole from '../database/models/courseRole';
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

  // Get all course parts for the course
  const courseParts = await CoursePart.findAll({
    where: {courseId: courseId},
  });

  // Get grades of all course parts
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
      coursePartId: {
        [Op.in]: courseParts.map(coursePart => coursePart.id),
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

  // Grades dict {userId: {coursePartId: GradeData[], ...}, ...}
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
    if (!(grade.coursePartId in userGrades[userId]))
      userGrades[userId][grade.coursePartId] = [];

    userGrades[userId][grade.coursePartId].push({
      gradeId: grade.id,
      grader: grader,
      aplusGradeSourceId: grade.aplusGradeSourceId,
      grade: grade.grade,
      exportedToSisu: grade.sisuExportDate,
      date: new Date(grade.date),
      expiryDate: new Date(grade.expiryDate),
      comment: grade.comment,
    });
  }

  // FinalGrades dict {userId: FinalGradeData[], ...}
  const finalGradesDict: {[key: string]: FinalGradeData[]} = {};
  for (const finalGrade of finalGrades) {
    const [user, grader] = validateUserAndGrader(finalGrade);

    const userId = user.id;
    if (!(userId in finalGradesDict)) finalGradesDict[userId] = [];

    finalGradesDict[userId].push({
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

  const result: StudentRow[] = Object.keys(userGrades).map(
    (userId): StudentRow => ({
      user: usersDict[userId],
      finalGrades: finalGradesDict[userId],
      courseParts: courseParts.map(coursePart => ({
        coursePartId: coursePart.id,
        coursePartName: coursePart.name,
        grades:
          (userGrades[userId][coursePart.id] as GradeData[] | undefined) ?? [],
      })),
    })
  );

  res.json(result);
};

/** @throws ApiError(400|404|409) */
export const addGrades = async (
  req: TypedRequestBody<typeof NewGradeArraySchema>,
  res: Response
): Promise<Response> => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);

  // Validate that course parts belong to correct course
  const coursePartIds = new Set<number>();
  for (const grade of req.body) {
    await validateCoursePartBelongsToCourse(courseId, grade.coursePartId);
    if (grade.aplusGradeSourceId) {
      await validateAplusGradeSourceBelongsToCoursePart(
        grade.coursePartId,
        grade.aplusGradeSourceId
      );
    }

    coursePartIds.add(grade.coursePartId);
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

  // Use studentsWithId to update course parts by flatmapping each
  // students grades into a one array of all the grades.
  const preparedBulkCreate: NewDbGradeData[] = req.body.map(gradeEntry => ({
    userId: studentNumberToId[gradeEntry.studentNumber],
    coursePartId: gradeEntry.coursePartId,
    graderId: grader.id,
    aplusGradeSourceId: gradeEntry.aplusGradeSourceId,
    date: gradeEntry.date,
    expiryDate: gradeEntry.expiryDate,
    grade: gradeEntry.grade,
  }));

  // TODO: Optimize if datasets are big.
  await AttainmentGrade.bulkCreate(preparedBulkCreate);

  // Create student roles for all the students (TODO: Remove role if grades are removed?)
  const dbCourseRoles = await CourseRole.findAll({
    attributes: ['userId'],
    where: {
      courseId: courseId,
      userId: {[Op.in]: students.map(student => student.id)},
      role: CourseRoleType.Student,
    },
  });
  const studentsWithRoles = new Set(dbCourseRoles.map(role => role.userId));
  const studentUserIds = Array.from(
    new Set(students.map(student => student.id))
  );
  const missingRoles = studentUserIds.filter(
    userId => !studentsWithRoles.has(userId)
  );
  await CourseRole.bulkCreate(
    missingRoles.map(userId => ({
      courseId: courseId,
      userId: userId,
      role: CourseRoleType.Student,
    }))
  );

  // After this point all the students' grades have been created
  return res.sendStatus(HttpCode.Created);
};

/** @throws ApiError(400|404|409) */
export const editGrade = async (
  req: TypedRequestBody<typeof EditGradeDataSchema>,
  res: Response
): Promise<void> => {
  const grader = req.user as JwtClaims;
  const [, gradeData] = await findAndValidateGradePath(
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
  const [, grade] = await findAndValidateGradePath(
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
  const existingResults: FinalGrade[] = [];
  const exportedToSisu: MarkSisuExport[] = [];

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

    const existingResult = existingResults.find(
      value => value.User?.studentNumber === finalGrade.User?.studentNumber
    );

    const gradeIsBetter = (
      newGrade: FinalGrade,
      oldGrade: FinalGrade
    ): boolean => {
      // Prefer manual final grades
      const newIsManual = newGrade.gradingModelId === null;
      const oldIsManual = oldGrade.gradingModelId === null;
      if (newIsManual && !oldIsManual) return true;
      if (oldIsManual && !newIsManual) return false;

      if (newGrade.grade > oldGrade.grade) return true;
      return (
        newGrade.grade === oldGrade.grade &&
        new Date(newGrade.date).getTime() >= new Date(oldGrade.date).getTime()
      );
    };

    if (existingResult) {
      // TODO: Maybe more options than just latest grade
      if (!gradeIsBetter(finalGrade, existingResult)) continue;

      existingResult.date = finalGrade.date;
      existingResult.grade = finalGrade.grade;
      existingResult.gradingModelId = finalGrade.gradingModelId;

      // Set existing course result grade
      const existingCourseResult = courseResults.find(
        value => value.studentNumber === finalGrade.User?.studentNumber
      );
      if (existingCourseResult === undefined) {
        // Should pretty much never happen
        logger.error("Couldn't find duplicate final grade again");
        throw new ApiError(
          "Couldn't find duplicate final grade again",
          HttpCode.InternalServerError
        );
      }
      existingCourseResult.grade = finalGrade.grade.toString();

      // There can be multiple grades, make sure only the exported grade is marked with timestamp.
      const userData = exportedToSisu.find(
        value => value.userId === finalGrade.User?.id
      );
      if (userData) userData.gradeId = finalGrade.id;
    } else {
      exportedToSisu.push({gradeId: finalGrade.id, userId: finalGrade.userId});

      // Assessment date must be in form dd.mm.yyyy.
      // HERE we want to find the latest completed grade for student
      const assessmentDate = (
        req.body.assessmentDate
          ? req.body.assessmentDate
          : await getDateOfLatestGrade(finalGrade.userId, course.id)
      ).toLocaleDateString('fi-FI');

      const completionLanguage = req.body.completionLanguage
        ? req.body.completionLanguage.toLowerCase()
        : course.languageOfInstruction.toLowerCase();

      let csvGrade;
      switch (course.gradingScale) {
        case GradingScale.Numerical:
          csvGrade = finalGrade.grade.toString();
          break;
        case GradingScale.PassFail:
          csvGrade = finalGrade.grade === 0 ? 'fail' : 'pass';
          break;
        case GradingScale.SecondNationalLanguage:
          if (finalGrade.grade === 0) csvGrade = 'Fail';
          else if (finalGrade.grade === 1) csvGrade = 'SAT';
          else csvGrade = 'G';
          break;
      }

      existingResults.push(finalGrade);
      courseResults.push({
        studentNumber: finalGrade.User.studentNumber,
        grade: csvGrade,
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
