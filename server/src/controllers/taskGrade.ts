// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT
import {stringify} from 'csv-stringify';
import {Op} from 'sequelize';

import {
  CourseRoleType,
  type EditTaskGradeData,
  type FinalGradeData,
  GradingScale,
  HttpCode,
  type LatestGrades,
  type NewTaskGrade,
  type SisuCsvUpload,
  type StudentRow,
  type TaskGradeData,
  type UserData,
  type UserIdArray,
} from '@/common/types';
import {validateAplusGradeSourceBelongsToCourseTask} from './utils/aplus';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import {validateCourseTaskBelongsToCourse} from './utils/courseTask';
import {parseFinalGrade} from './utils/finalGrade';
import {
  findAndValidateGradePath,
  getDateOfLatestGrade,
  getFinalGradesFor,
  parseTaskGrade,
  studentNumbersExist,
  validateUserAndGrader,
} from './utils/taskGrade';
import httpLogger from '../configs/winston';
import {sequelize} from '../database';
import AplusGradeSource from '../database/models/aplusGradeSource';
import CoursePart from '../database/models/coursePart';
import CourseRole from '../database/models/courseRole';
import CourseTask from '../database/models/courseTask';
import FinalGrade from '../database/models/finalGrade';
import TaskGrade from '../database/models/taskGrade';
import User from '../database/models/user';
import {
  ApiError,
  type Endpoint,
  type JwtClaims,
  type NewDbGradeData,
} from '../types';

/**
 * () => StudentRow[]
 *
 * @throws ApiError(400|404)
 */
export const getGrades: Endpoint<void, StudentRow[]> = async (req, res) => {
  const courseId = await validateCourseId(req.params.courseId);

  // Get all course tasks for the course
  const courseParts = await CoursePart.findAll({where: {courseId}});
  const courseTasks = await CourseTask.findAll({
    where: {coursePartId: courseParts.map(part => part.id)},
  });

  // Get grades of all course tasks
  const grades = await TaskGrade.findAll({
    include: [
      {model: User, attributes: ['id', 'name', 'email', 'studentNumber']},
      {
        model: User,
        as: 'grader',
        attributes: ['id', 'name', 'email', 'studentNumber'],
      },
      {model: AplusGradeSource},
    ],
    where: {
      courseTaskId: courseTasks.map(courseTask => courseTask.id),
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

  type StudentData = {
    user: UserData & {studentNumber: string};
    grades: {[key: string]: TaskGradeData[]};
    finalGrades: FinalGradeData[];
  };
  const studentData = new Map<number, StudentData>();

  for (const grade of grades) {
    const [user] = validateUserAndGrader(grade);
    if (!studentData.has(user.id))
      studentData.set(user.id, {user, grades: {}, finalGrades: []});

    const userGrades = (studentData.get(user.id) as StudentData).grades;
    if (!Object.hasOwn(userGrades, grade.courseTaskId))
      userGrades[grade.courseTaskId] = [];

    userGrades[grade.courseTaskId].push(parseTaskGrade(grade));
  }

  for (const finalGrade of finalGrades) {
    const [user] = validateUserAndGrader(finalGrade);

    if (!studentData.has(user.id))
      studentData.set(user.id, {user, grades: {}, finalGrades: []});

    const userFinalGrades = (studentData.get(user.id) as StudentData)
      .finalGrades;
    userFinalGrades.push(parseFinalGrade(finalGrade));
  }

  const studentRows = Array.from(studentData.values()).map(
    (data): StudentRow => ({
      user: data.user,
      finalGrades: data.finalGrades,
      courseTasks: courseTasks.map(courseTask => ({
        courseTaskId: courseTask.id,
        courseTaskName: courseTask.name,
        grades:
          (data.grades[courseTask.id] as TaskGradeData[] | undefined) ?? [],
      })),
    })
  );

  res.json(studentRows);
};

/**
 * (NewTaskGrade[]) => void
 *
 * @throws ApiError(400|404|409)
 */
export const addGrades: Endpoint<NewTaskGrade[], void> = async (req, res) => {
  const grader = req.user as JwtClaims;
  const courseId = await validateCourseId(req.params.courseId);

  // Validate that course tasks and A+ grade sources belong to correct course
  const validCourseTaskIds = new Set<number>();
  const validAPlusCourseTaskIds = new Set<number>();
  for (const grade of req.body) {
    // Validate course task id
    if (!validCourseTaskIds.has(grade.courseTaskId)) {
      await validateCourseTaskBelongsToCourse(courseId, grade.courseTaskId);
      validCourseTaskIds.add(grade.courseTaskId);
    }

    // Validate A+ course task id
    if (
      grade.aplusGradeSourceId !== undefined &&
      !validAPlusCourseTaskIds.has(grade.aplusGradeSourceId)
    ) {
      await validateAplusGradeSourceBelongsToCourseTask(
        grade.courseTaskId,
        grade.aplusGradeSourceId
      );
      validAPlusCourseTaskIds.add(grade.aplusGradeSourceId);
    }
  }

  // Check all users (students) exists in db, create new users if needed.
  // Make sure each studentNumber is only in the list once
  const studentNumbers = Array.from(
    new Set(req.body.map(grade => grade.studentNumber))
  );

  const dbStudentNumbers = (await User.findAll({
    attributes: ['studentNumber'],
    where: {
      studentNumber: {[Op.in]: studentNumbers},
    },
  })) as {studentNumber: string}[];
  const foundStudents = new Set(
    dbStudentNumbers.map(student => student.studentNumber)
  );
  const nonExistingStudents = studentNumbers.filter(
    id => !foundStudents.has(id)
  );

  // Create missing users
  if (nonExistingStudents.length > 0) {
    await sequelize.transaction(async t => {
      await User.bulkCreate(
        nonExistingStudents.map(studentNumber => ({
          studentNumber: studentNumber,
        })),
        {transaction: t}
      );
    });
  }

  // All students now exists in the database.
  const students = (await User.findAll({
    attributes: ['id', 'studentNumber'],
    where: {studentNumber: {[Op.in]: studentNumbers}},
  })) as {id: number; studentNumber: string}[];

  const studentNumberToId = Object.fromEntries(
    students.map(student => [student.studentNumber, student.id])
  );

  await sequelize.transaction(async t => {
    const preparedBulkCreate: NewDbGradeData[] = [];

    for (const gradeEntry of req.body) {
      const userId = studentNumberToId[gradeEntry.studentNumber];

      // If a student already has a grade for a particular A+ grade source,
      // don't create a new grade row. Instead, update the existing one.
      if (gradeEntry.aplusGradeSourceId !== undefined) {
        const grade = await TaskGrade.findOne({
          where: {
            userId: userId,
            courseTaskId: gradeEntry.courseTaskId,
            aplusGradeSourceId: gradeEntry.aplusGradeSourceId,
          },
        });

        if (grade) {
          await grade
            .set({
              grade: gradeEntry.grade,
              date: gradeEntry.date,
              expiryDate: gradeEntry.expiryDate,
              graderId: grader.id,
            })
            .save({transaction: t});
          continue;
        }
      }

      preparedBulkCreate.push({
        userId: userId,
        courseTaskId: gradeEntry.courseTaskId,
        graderId: grader.id,
        aplusGradeSourceId: gradeEntry.aplusGradeSourceId,
        date: gradeEntry.date,
        expiryDate: gradeEntry.expiryDate,
        grade: gradeEntry.grade,
      });
    }

    // TODO: Takes a while, optimize?
    await TaskGrade.bulkCreate(preparedBulkCreate, {transaction: t});
  });

  // Create student roles for all the students (TODO: Remove role if grades are removed?)
  const studentUserIds = students.map(student => student.id);
  const dbCourseRoles = await CourseRole.findAll({
    attributes: ['userId'],
    where: {
      courseId: courseId,
      userId: {[Op.in]: studentUserIds},
      role: CourseRoleType.Student,
    },
  });
  const studentsWithRoles = new Set(dbCourseRoles.map(role => role.userId));
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

  return res.sendStatus(HttpCode.Created);
};

/**
 * (EditTaskGradeData) => void
 *
 * @throws ApiError(400|404|409)
 */
export const editGrade: Endpoint<EditTaskGradeData, void> = async (
  req,
  res
) => {
  const grader = req.user as JwtClaims;
  const [, gradeData] = await findAndValidateGradePath(
    req.params.courseId,
    req.params.gradeId
  );

  const {grade, date, expiryDate, comment} = req.body;

  if (
    date !== undefined &&
    expiryDate === undefined &&
    gradeData.expiryDate !== null &&
    date > new Date(gradeData.expiryDate)
  ) {
    throw new ApiError(
      `New date (${date.toString()}) can't be later than` +
        ` existing expiration date (${gradeData.expiryDate.toString()})`,
      HttpCode.BadRequest
    );
  } else if (
    expiryDate &&
    date === undefined &&
    new Date(gradeData.date) > expiryDate
  ) {
    throw new ApiError(
      `New expiration date (${expiryDate.toString()}) can't be before` +
        ` existing date (${gradeData.date.toString()})`,
      HttpCode.BadRequest
    );
  }

  if (gradeData.aplusGradeSourceId !== null && grade !== undefined) {
    throw new ApiError(
      'Grade field of A+ grades cannot be edited',
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

/**
 * () => void
 *
 * @throws ApiError(400|404|409)
 */
export const deleteGrade: Endpoint<void, void> = async (req, res) => {
  const [, grade] = await findAndValidateGradePath(
    req.params.courseId,
    req.params.gradeId
  );
  await grade.destroy();

  res.sendStatus(HttpCode.Ok);
};

/**
 * (UserIdArray) => LatestGrades
 *
 * @throws ApiError(404)
 */
export const getLatestGrades: Endpoint<UserIdArray, LatestGrades> = async (
  req,
  res
) => {
  const dbUsers = await User.findAll({where: {id: req.body}});
  if (dbUsers.length < req.body.length)
    throw new ApiError('Some user ids not found', HttpCode.NotFound);

  const dbGrades = await TaskGrade.findAll({
    where: {userId: req.body},
    group: ['userId'],
    attributes: [
      'userId',
      [sequelize.fn('MAX', sequelize.col('date')), 'date'],
    ],
    raw: true,
  });
  const latestGrades: LatestGrades = dbGrades.map(item => ({
    userId: item.userId,
    date: new Date(item.date),
  }));

  const missingStudents = new Set<number>(req.body);
  for (const grade of latestGrades) missingStudents.delete(grade.userId);
  for (const userId of missingStudents) {
    latestGrades.push({userId: userId, date: null});
  }

  res.json(latestGrades);
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
      httpLogger.error(
        `Final grade ${finalGrade.id} user was undefined even though student numbers were validated`
      );
      throw new ApiError(
        'Final grade user was undefined',
        HttpCode.InternalServerError
      );
    }
    if (finalGrade.User.studentNumber === null) {
      httpLogger.error(
        `Final grade ${finalGrade.id} user student number was null even though student numbers were validated`
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
        httpLogger.error("Couldn't find duplicate final grade again");
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
        req.body.assessmentDate ??
        (await getDateOfLatestGrade(finalGrade.userId, course.id))
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
    {sisuExportDate: new Date()},
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