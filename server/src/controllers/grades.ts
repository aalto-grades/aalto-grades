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

import { ApiError } from '../types/error';
import { idSchema } from '../types/general';
import { Grade, Student } from '../types/grades';
import { HttpCode } from '../types/httpCode';
import { validateCourseAndInstance } from './utils/courseInstance';

/**
 * Parse and extract attainment id's from the CSV file header.
 * Correct format: "StudentNo,C3I9A1,C3I9A2,C3I9A3,C3I9A4,C3I9A5..."
 * @param {Array<string>} header - Header part of the CSV file.
 * @returns {Array<number>} - Array containing the id's of attainments.
 * @throws {ApiError} - If first column not "StudentNo" (case-insensitive)
 * header array is empty or any of the attainment tags malformed or missing.
 */
export function parseHeader(header: Array<string>): Array<number> {
  const attainmentIds: Array<number> = [];
  const errors: Array<string> = [];

  if (header.length === 0) {
    throw new ApiError(
      'CSV file header empty, please upload valid CSV.',
      HttpCode.UnprocessableEntity
    );
  }

  // Check that first column matches requirements.
  if (header[0].toLocaleLowerCase() !== 'studentno') {
    errors.push(
      `CSV parse error, header row column 1 must be "StudentNo", received "${header[0]}"`
    );
  }

  // Remove first input "StudentNo" by slicing. Avoid shifting, will have side-effects later on.
  const attainmentData: Array<string> = header.slice(1);

  if (attainmentData.length === 0) {
    throw new ApiError(
      'No attainments found from the header, please upload valid CSV.',
      HttpCode.UnprocessableEntity
    );
  }

  // Regex for checking attainment matches the desired format e.g., C1I1A1.
  const regex: RegExp = /C\d+I\d+A(\d+)\b/;

  attainmentData.forEach((str: string) => {
    const match: RegExpMatchArray | null = str.match(regex);
    if (match && match[1]) {
      attainmentIds.push(parseInt(match[1], 10));
    } else {
      errors.push(
        // eslint-disable-next-line max-len
        `Header attainment data parsing failed at column ${attainmentData.indexOf(str) + 2}. Use format C{courseId}I{courseInstanceId}A{attainmentId}.`
      );
    }
  });

  if (errors.length > 0) {
    throw new ApiError('', HttpCode.BadRequest, errors);
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
export function parseGrades(
  studentGradingData: Array<Array<string>>, attainmentIds: Array<number>
): Array<Student> {
  const students: Array<Student> = [];
  const errors: Array<string> = [];
  let currentRow: number = 2;

  for (const row of studentGradingData) {
    const studentNumber: string = row[0];
    const gradingData: Array<string> = row.slice(1);

    if (row.length === 0) {
      continue;
    }

    const student: Student = {
      studentNumber,
      grades: [],
    };

    for (let i: number = 0; i < attainmentIds.length; i++) {

      if (isNaN(Number(gradingData[i]))) {
        errors.push(
          `CSV file row ${currentRow} column ${i + 2} expected number, received "${gradingData[i]}"`
        );
      } else {
        const grade: Grade = {
          attainmentId: attainmentIds[i],
          points: parseInt(gradingData[i], 10)
        };
        student.grades.push(grade);
      }
    }
    ++currentRow;
    students.push(student);
  }

  if (errors.length > 0) {
    throw new ApiError('', HttpCode.BadRequest, errors);
  }
  return students;
}

/**
 * Asynchronously adds grades from a CSV file to the database.
 * @param {Request} req - The HTTP request containing the CSV file.
 * @param {Response} res - The HTTP response to be sent to the client.
 * @param {NextFunction} next - The next middleware function to be executed in the pipeline.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If the CSV file loading fails.
*/
export async function addGrades(req: Request, res: Response, next: NextFunction): Promise<void> {
  /*
   * TODO:
   * - Check that the requester is logged in, 401 Unauthorized if not.
   * - Check that the requester is authorized to add grades, 403 Forbidden if not.
   * - Validate csv fields, csv has to match predetermined format, 400 Bad request.
   * - Validate attainments belong to the course instance, 409 Conflict.
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
    .on('error', function (err: unknown): void {
      // Pass the error manually to the error handler, controllerDispatcher will not catch here.
      next(err);
    })
    .on('end', async function (): Promise<void> {

      /**
       * TODO:
       * - Check students exists in the database, create new entries if needed.
       * - Check attainments exists in the database.
       * - Add the grading data to the database.
       */

      try {
        // Header having colum information, e.g., StudentNo,C3I9A1,C3I9A2,C3I9A3,C3I9A4,C3I9A5...
        const header: Array<string> = studentGradingData.shift() as Array<string>;

        // Parse header and grades separately. Always first parse header before
        // parsing the grades as the grade parser needs the attainment id array.
        const attainmentIds: Array<number> = parseHeader(header);
        const parsedStudentData: Array<Student> = parseGrades(studentGradingData, attainmentIds);

        console.log(parsedStudentData);

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
            // eslint-disable-next-line max-len
            `Attainments with following IDs do not exist or belong to this course instance: ${nonExistingIds.join(', ')}.`,
            HttpCode.UnprocessableEntity
          );
        }

        // After this point all attainments are confirmed to exist and belong to the instance.

        // Check all users (students) exists in db, create new users if needed.
        const studentNumbers: Array<string> = parsedStudentData.map(
          (student: Student) => student.studentNumber
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

        // TODO: check that teacher id is not listed accidentally in the CSV/students list
        // to prevent accidental role change from TEACHER or TEACHER_IN_CHARGE to STUDENT.

        // Check (and add if needed) that existing users have 'STUDENT' role on the instance.
        // Note. updateOnDuplicate works as an UPSERT operation in bulkCreate.
        await CourseInstanceRole.bulkCreate(
          students.map((user: User) => {
            return {
              userId: user.id,
              courseInstanceId,
              role: 'STUDENT'
            };
          }), {
            updateOnDuplicate: ['role']
          }
        );

        // Create new users (students) and add to the course instance with role 'STUDENT'.
        if (nonExistingStudents.length > 0) {

          await sequelize.transaction(async (t: Transaction) => {
            const newUsers: Array<User> = await User.bulkCreate(
              nonExistingStudents.map((studentNo: string) => {
                return {
                  studentId: studentNo
                };
              }), { transaction: t }
            );

            await CourseInstanceRole.bulkCreate(
              newUsers.map((user: User) => {
                return {
                  userId: user.id,
                  courseInstanceId,
                  role: 'STUDENT'
                };
              }), { transaction: t }
            );

            students = students.concat(newUsers);
          });
        }

        // After this point all students are confirmed to exist and belong to the instance.

        // Input users db id to the parsedStudentData based on student number.
        const studentsWithId: Array<Student> = parsedStudentData.map(
          (student: Student): Student => {

            const matchingUser: User | undefined = students.find(
              (user: User) => user.dataValues.studentId === student.studentNumber
            );

            return {
              ...student,
              id: matchingUser?.id as number
            };
          });

        console.log(studentsWithId);

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
