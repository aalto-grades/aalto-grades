// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {stringify} from 'csv-stringify';
import {Request, Response} from 'express';
import {Op} from 'sequelize';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  EditGradeOptionSchema,
  FinalGradeData,
  GradeOption,
  HttpCode,
  NewGradeArraySchema,
  SisuCsvUploadSchema,
  StudentRow,
} from '@common/types';
import {sequelize} from '../database';
import Attainment from '../database/models/attainment';
import AttainmentGrade from '../database/models/attainmentGrade';
import FinalGrade from '../database/models/finalGrade';
import User from '../database/models/user';
import {AttainmentGradeModelData, JwtClaims} from '../types';
import {validateAttainmentBelongsToCourse} from './utils/attainment';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {
  findAndValidateAttainmentGradePath,
  getDateOfLatestGrade,
  getFinalGradesFor,
  studentNumbersExist,
} from './utils/grades';
import {isTeacherInChargeOrAdmin} from './utils/user';

/**
 * Responds with StudentRow[]
 */
export const getGrades = async (req: Request, res: Response): Promise<void> => {
  const courseId = await validateCourseId(req.params.courseId);

  // Get all attainments for the course
  const attainments = await Attainment.findAll({
    where: {courseId: courseId},
  });

  // Get grades of all attainments
  const grades = await AttainmentGrade.findAll({
    include: {all: true},
    where: {
      attainmentId: {
        [Op.in]: attainments.map(attainment => attainment.id),
      },
    },
  });

  // Get finalGrades for all students
  const finalGrades = await FinalGrade.findAll({
    include: {all: true},
    where: {courseId: courseId},
  });

  // User dict of unique users {userId: User, ...}
  const usersDict: {[key: string]: User} = {};
  for (const grade of grades) {
    if (grade.User === undefined) {
      console.error('Found an grade with no user');
      continue;
    }
    if (!(grade.User.id in usersDict)) {
      usersDict[grade.User.id] = grade.User;
    }
  }

  // Grades dict {userId: {attId: GradeOption[], ...}, ...}
  const userGrades: {[key: string]: {[key: string]: GradeOption[]}} = {};
  for (const grade of grades) {
    if (grade.grader === undefined) {
      console.error('Found an grade with no grader');
      continue;
    }

    const userId = grade.userId;
    if (!(userId in userGrades)) userGrades[userId] = {};
    if (!(grade.attainmentId in userGrades[userId]))
      userGrades[userId][grade.attainmentId] = [];

    userGrades[userId][grade.attainmentId].push({
      gradeId: grade.id,
      grader: {
        id: grade.grader.id,
        name: grade.grader.name,
        studentNumber: '',
      },
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
    const userId = fGrade.userId;
    if (!(userId in finalGradesDict)) finalGradesDict[userId] = [];

    finalGradesDict[userId].push({
      userId: fGrade.userId,
      courseId: fGrade.courseId,
      assessmentModelId: fGrade.assessmentModelId,
      graderId: fGrade.graderId,
      grade: fGrade.grade,
      date: new Date(fGrade.date),
      sisuExportDate: fGrade.sisuExportDate,
    });
  }

  const result: StudentRow[] = Object.keys(userGrades).map(userId => ({
    user: {
      id: usersDict[userId].id,
      studentNumber: usersDict[userId].studentNumber,
    },
    finalGrades: finalGradesDict[userId],
    attainments: attainments.map(attainment => ({
      attainmentId: attainment.id,
      attainmentName: attainment.name,
      grades:
        (userGrades[userId][attainment.id] as GradeOption[] | undefined) ?? [],
    })),
  }));

  res.json(result);
};

/**
 * Get grading data formatted to Sisu compatible format for exporting grades to Sisu.
 * Documentation and requirements for Sisu CSV file structure available at
 * https://wiki.aalto.fi/display/SISEN/Assessment+of+implementations
 * Responds with text/csv
 */
export const getSisuFormattedGradingCSV = async (
  req: TypedRequestBody<typeof SisuCsvUploadSchema>,
  res: Response
): Promise<void> => {
  const sisuExportDate = new Date();
  const course = await findAndValidateCourseId(req.params.courseId);

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  await studentNumbersExist(req.body.studentNumbers);

  /**
   * TODO: only one grade per user per instance is allowed
   */
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

  for (const finalGrade of finalGrades) {
    if (finalGrade.User === undefined) {
      console.error(
        'Final grade found with no matching user even though student nubmers were validated'
      );
      continue;
    }
    const existingResult = courseResults.find(
      value => value.studentNumber === finalGrade.User?.studentNumber
    );

    if (existingResult) {
      if (finalGrade.grade <= parseInt(existingResult.grade)) continue; // TODO: Maybe more options than just best grade
      existingResult.grade = finalGrade.grade.toString(); // TODO: Confirm that finalgrade.grade is valid

      // There can be multiple grades, make sure only the exported grade is marked with timestamp.
      const userData = exportedToSisu.find(
        value => value.userId === finalGrade.User?.id
      );
      if (userData) userData.gradeId = finalGrade.id;
    } else {
      exportedToSisu.push({gradeId: finalGrade.id, userId: finalGrade.userId});

      courseResults.push({
        studentNumber: finalGrade.User.studentNumber,
        // Round to get final grades as an integer.
        grade: String(Math.round(finalGrade.grade)),
        credits: course.maxCredits,
        // Assessment date must be in form dd.mm.yyyy.
        // HERE we want to find the latest completed attainment grade for student
        assessmentDate: (req.body.assessmentDate
          ? req.body.assessmentDate
          : await getDateOfLatestGrade(finalGrade.userId, course.id)
        ).toLocaleDateString('fi-FI'),
        completionLanguage: req.body.completionLanguage
          ? req.body.completionLanguage
          : course.languageOfInstruction, // TODO: Confirm that is in lower case
        // Comment column is required, but can be empty.
        comment: '', // finalGrade.comment, TODO: Add comment to finalGrade DB table
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

export const addGrades = async (
  req: TypedRequestBody<typeof NewGradeArraySchema>,
  res: Response
): Promise<Response | void> => {
  const grader = req.user as JwtClaims;

  const courseId = await validateCourseId(req.params.courseId);

  await isTeacherInChargeOrAdmin(grader, courseId);

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

  let students = await User.findAll({
    attributes: ['id', 'studentNumber'],
    where: {
      studentNumber: {[Op.in]: studentNumbers},
    },
  });
  const foundStudents = students.map(student => student.studentNumber);
  const nonExistingStudents = studentNumbers.filter(
    id => !foundStudents.includes(id)
  );

  await sequelize.transaction(async t => {
    if (nonExistingStudents.length === 0) return;

    // Create new users (students) from the CSV.
    const newUsers = await User.bulkCreate(
      nonExistingStudents.map(studentNumber => ({
        studentNumber: studentNumber,
      })),
      {transaction: t}
    );
    students = students.concat(newUsers);
  });

  // All students now exists in the database.
  students = await User.findAll({
    attributes: ['id', 'studentNumber'],
    where: {
      studentNumber: {
        [Op.in]: studentNumbers,
      },
    },
  });

  const studentNumberToId = Object.fromEntries(
    students.map(student => [student.studentNumber, student.id])
  );

  // Use studentsWithId to update attainments by flatmapping each
  // students grades into a one array of all the grades.
  const preparedBulkCreate: AttainmentGradeModelData[] = req.body.map(
    gradeEntry => ({
      userId: studentNumberToId[gradeEntry.studentNumber],
      attainmentId: gradeEntry.attainmentId,
      graderId: grader.id,
      date: gradeEntry.date,
      expiryDate: gradeEntry.expiryDate,
      grade: gradeEntry.grade,
    })
  );

  // TODO: Optimize if datasets are big.
  await AttainmentGrade.bulkCreate(preparedBulkCreate);

  // After this point all the students' attainment grades have been created
  return res.sendStatus(HttpCode.Created);
};

export const editGrade = async (
  req: TypedRequestBody<typeof EditGradeOptionSchema>,
  res: Response
): Promise<void> => {
  const [course, gradeData] = await findAndValidateAttainmentGradePath(
    req.params.courseId,
    req.params.gradeId
  );

  const grader = req.user as JwtClaims;
  await isTeacherInChargeOrAdmin(grader, course.id);

  const {grade, date, expiryDate, comment} = req.body;

  await gradeData
    .set({
      grade: grade ?? gradeData.grade,
      date: date === undefined ? gradeData.date : date,
      expiryDate: expiryDate === undefined ? gradeData.expiryDate : expiryDate,
      comment: comment && comment.length > 0 ? comment : gradeData.comment,
      graderId: grader.id,
    })
    .save();

  res.sendStatus(HttpCode.Ok);
};

export const deleteGrade = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [course, grade] = await findAndValidateAttainmentGradePath(
    req.params.courseId,
    req.params.gradeId
  );
  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  await grade.destroy();

  res.sendStatus(HttpCode.Ok);
};
