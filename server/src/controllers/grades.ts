// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { parse, Parser } from 'csv-parse';
import { NextFunction, Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';

import { sequelize } from '../database';
import Attainable from '../database/models/attainable';
import CourseInstanceRole from '../database/models/courseInstanceRole';
import User from '../database/models/user';
import UserAttainmentGrade from '../database/models/userAttainmentGrade';

import { CourseInstanceRoleType } from '../types/course';
import { ApiError } from '../types/error';
import { idSchema } from '../types/general';
import { UserAttainmentGradeData, StudentGrades } from '../types/grades';
import { HttpCode } from '../types/httpCode';
import { validateCourseAndInstance } from './utils/courseInstance';

/**
 * Parse and extract attainment IDs from the CSV file header.
 * Correct format: "StudentNo,C3I9A1,C3I9A2,C3I9A3,C3I9A4,C3I9A5..."
 * @param {Array<string>} header - Header part of the CSV file.
 * @returns {Array<number>} - Array containing the id's of attainments.
 * @throws {ApiError} - If first column not "StudentNo" (case-insensitive)
 * header array is empty or any of the attainment tags malformed or missing.
 */
export function parseHeaderFromCsv(header: Array<string>): Array<number> {
  const attainmentIds: Array<number> = [];
  const errors: Array<string> = [];

  // Remove first input "StudentNo". Avoid using shift(), will have side-effects outside function.
  const attainmentData: Array<string> = header.slice(1);

  // Regex for checking attainment matches the desired format e.g., C1I1A1.
  const attainmentTagRegex: RegExp = /C\d+I\d+A(\d+)\b/;

  if (attainmentData.length === 0) {
    throw new ApiError(
      'No attainments found from the header, please upload valid CSV.',
      HttpCode.BadRequest
    );
  }

  attainmentData.forEach((str: string) => {
    const match: RegExpMatchArray | null = str.match(attainmentTagRegex);
    if (match && match[1]) {
      attainmentIds.push(parseInt(match[1], 10));
    } else {
      errors.push(
        `Header attainment data parsing failed at column ${attainmentData.indexOf(str) + 2}.` +
        ` Received ${str}, expected format C{courseId}I{courseInstanceId}A{attainmentId}.`
      );
    }
  });

  // If any column parsing fails, throw error with invalid column info.
  if (errors.length > 0) {
    throw new ApiError(errors, HttpCode.BadRequest);
  }
  return attainmentIds;
}

/**
 * Parses student grading data from a CSV file and creates an array of Student objects.
 * @param {Array<Array<string>>} studentGradingData - Body part of the CSV file.
 * @param {Array<number>} attainmentIds - Array of attainment ID corresponding to each grade column.
 * @returns {Array<Student>} - Array of Student objects containing their student number and
 * an array of their grades.
 * @throws {ApiError} - If there is an error in the CSV file (e.g. incorrect data type in a cell).
 * Collects all errors found to an array, does not throw error immediately on first incorrect value.
*/
export function parseGradesFromCsv(
  studentGradingData: Array<Array<string>>, attainmentIds: Array<number>
): Array<StudentGrades> {
  const students: Array<StudentGrades> = [];
  const errors: Array<string> = [];

  /**
   * currentRow and currentColumn are user facing row and column numbers of the
   * uploaded CSV file. They are the index of the row and column plus 1,
   * so the first row and column in the CSV file will have the index 0 but the
   * number 1. See an example of row and column numbers below.
   *
   *        | column 1  | column 2 | column 3 |
   *  --------------------------------------------
   *  row 1:| StudentNo | C1I1A1   | C1I1A6   |
   *  row 2:| 812472    | 12       | 32       |
   *  row 3:| 545761    | 0        | 15       |
   *  ...
   *  row n:| ...
   *
   * currentRow is incremented after a row has been parsed, currentColumn is
   * incremented after a column of a row has been parsed and is reset to 2
   * when the current row has been fully parsed.
   *
   * Row and column 1 are handled separately.
   */
  let currentRow: number = 2;
  let currentColumn: number = 2;

  for (const row of studentGradingData) {
    // TODO: validate with regex that valid student number?
    const studentNumber: string = row[0];
    const gradingData: Array<string> = row.slice(1);

    const student: StudentGrades = {
      studentNumber,
      grades: [],
    };

    for (let i: number = 0; i < attainmentIds.length; i++) {

      if (isNaN(Number(gradingData[i]))) {
        errors.push(
          `CSV file row ${currentRow} column ${currentColumn}` +
          ` expected number, received "${gradingData[i]}"`
        );
      } else {
        const grade: UserAttainmentGradeData = {
          attainableId: attainmentIds[i],
          points: parseInt(gradingData[i], 10)
        };
        student.grades.push(grade);
      }
      ++currentColumn;
    }
    // Reset column number to 2 for parsing the next row.
    currentColumn = 2;
    ++currentRow;
    students.push(student);
  }

  // If any row parsing fails, throw error with invalid row info.
  if (errors.length > 0) {
    throw new ApiError(errors, HttpCode.BadRequest);
  }
  return students;
}

/**
 * Asynchronously adds grades from a CSV file to the database.
 * @param {Request} req - The HTTP request containing the CSV file.
 * @param {Response} res - The HTTP response to be sent to the client.
 * @param {NextFunction} next - The next middleware function to be executed in the pipeline.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If loading the CSV file fails, parsing the header or body of the CSV fails, or 
 * the CSV file contains attainments which don't belong to the specified course or course instance.
*/
export async function addGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
  /*
   * TODO:
   * - Check that the requester is logged in, 401 Unauthorized if not.
   * - Check that the requester is authorized to add grades, 403 Forbidden if not.
   * - Check grading points are not higher than max points of the attainment.
   */

  // Get path parameters.
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);

  // Validation.
  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });
  await validateCourseAndInstance(courseId, courseInstanceId);

  if (!req?.file) {
    throw new ApiError(
      'CSV file not found in the request. To upload CSV file, set input field name as "csv_data"',
      HttpCode.BadRequest
    );
  }

  // Convert CSV to string for the parser.
  const data: string = req.file.buffer.toString();

  // Array for collecting CSV row data.
  const studentGradingData: Array<Array<string>> = [];

  // TODO: should user be allowed to define delimiter in the request.
  const parser: Parser = parse({
    delimiter: ','
  });

  parser
    .on('readable', function (): void {
      let row: Array<string>;
      while ((row = parser.read()) !== null) {
        studentGradingData.push(row);
      }
    })
    .on('error', next) // Stream causes uncaught exception, pass error manually to the errorHandler.
    .on('end', async (): Promise<void> => {
      try {
        // Header having colum information, e.g., "StudentNo,C3I9A1,C3I9A2,C3I9A3,C3I9A4,C3I9A5..."
        const header: Array<string> = studentGradingData.shift() as Array<string>;

        // Parse header and grades separately. Always first parse header before
        // parsing the grades as the grade parser needs the attainment id array.
        const attainmentIds: Array<number> = parseHeaderFromCsv(header);
        let parsedStudentData: Array<StudentGrades> = parseGradesFromCsv(
          studentGradingData, attainmentIds
        );

        // Fetch all attainments from db based on the id's extracted from the CSV.
        const attainments: Array<Attainable> = await Attainable.findAll({
          attributes: ['id'],
          where: {
            id: {
              [Op.in]: attainmentIds
            },
            courseId,
            courseInstanceId,
          }
        });

        // Check if any of the CSV attainment id's does not exist in the db, throw ApiError if so.
        const foundIds: Array<number> = attainments.map((attainment: Attainable) => attainment.id);
        const nonExistingIds: Array<number> = attainmentIds.filter(
          (id: number) => !foundIds.includes(id)
        );

        if (nonExistingIds.length > 0) {
          throw new ApiError(
            'Attainments with following IDs do not exist or' +
            ` belong to this course instance: ${nonExistingIds.join(', ')}.`,
            HttpCode.UnprocessableEntity
          );
        }

        // After this point all attainments are confirmed to exist and belong to the instance.

        // Check all users (students) exists in db, create new users if needed.
        const studentNumbers: Array<string> = parsedStudentData.map(
          (student: StudentGrades) => student.studentNumber
        );

        let students: Array<User> = await User.findAll({
          attributes: ['id', 'studentId'],
          where: {
            studentId: {
              [Op.in]: studentNumbers
            }
          }
        });

        const foundStudents: Array<string> = students.map((student: User) => student.studentId);
        const nonExistingStudents: Array<string> = studentNumbers.filter(
          (id: string) => !foundStudents.includes(id)
        );

        // Check that teacher id is not listed accidentally in the CSV/students list
        // to prevent accidental role change from TEACHER or TEACHER_IN_CHARGE to STUDENT.
        const teachers: Array<CourseInstanceRole> = await CourseInstanceRole.findAll({
          attributes: ['userId'],
          where: {
            userId: {
              [Op.in]: students.map((student: User) => student.id)
            },
            role: {
              [Op.in]: [CourseInstanceRoleType.Teacher, CourseInstanceRoleType.TeacherInCharge]
            },
            courseInstanceId
          }
        });

        if (teachers.length > 0) {
          throw new ApiError(
            'User(s) with role "TEACHER" or "TEACHER_IN_CHARGE" found from the CSV.',
            HttpCode.Conflict
          );
        }

        await sequelize.transaction(async (t: Transaction) => {
          // Create new users (students) if any found from the CSV.
          if (nonExistingStudents.length > 0) {
            const newUsers: Array<User> = await User.bulkCreate(
              nonExistingStudents.map((studentNo: string) => {
                return {
                  studentId: studentNo
                };
              }), { transaction: t }
            );
            students = students.concat(newUsers);
          }

          // Check (and add if needed) that existing users have 'STUDENT' role on the instance.
          // Add also newly created users to the course instance with role 'STUDENT'.
          // Note. updateOnDuplicate works as an UPSERT operation in bulkCreate.
          await CourseInstanceRole.bulkCreate(
            students.map((user: User) => {
              return {
                userId: user.id,
                courseInstanceId,
                role: CourseInstanceRoleType.Student
              };
            }), {
              transaction: t,
              updateOnDuplicate: ['role']
            }
          );
        });

        // After this point all students confirmed to exist and belong to the instance as STUDENTs.

        // Add users db id to the parsedStudentData based on student number.
        parsedStudentData = parsedStudentData.map(
          (student: StudentGrades): StudentGrades => {
            const matchingUser: User = students.find(
              (user: User) => user.dataValues.studentId === student.studentNumber
            ) as User;

            return {
              ...student,
              id: matchingUser.id
            };
          });

        // Use studentsWithId to update attainments by flatmapping each
        // students grades into a one array of all the grades.
        const preparedBulkCreate: Array<UserAttainmentGradeData> = parsedStudentData.flatMap(
          (student: StudentGrades): Array<UserAttainmentGradeData> => {
            const studentGradingData: Array<UserAttainmentGradeData> = student.grades.map(
              (grade: UserAttainmentGradeData): UserAttainmentGradeData => {
                return {
                  userId: student.id as number,
                  ...grade
                };
              });
            return studentGradingData;
          });

        // TODO: Optimize if datasets are big.
        await UserAttainmentGrade.bulkCreate(preparedBulkCreate, { updateOnDuplicate: ['points'] });

        // After this point all the students' attainment grades have been created or
        // updated in the database.

        res.status(HttpCode.Ok).json({
          success: true,
          data: {}
        });
        return;
      } catch (err: unknown) {
        next(err);
      }
    });

  // Write stringified CSV data to the csv-parser's stream.
  parser.write(data);

  // Close the readable stream once data reading finished.
  parser.end();
}
