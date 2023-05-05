// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { parse, Parser } from 'csv-parse';
import { NextFunction, Request, Response } from 'express';
import { Op, Transaction } from 'sequelize';
import * as yup from 'yup';

import { sequelize } from '../database';
import Attainable from '../database/models/attainable';
import CourseInstanceRole from '../database/models/courseInstanceRole';
import User from '../database/models/user';
import UserAttainmentGrade from '../database/models/userAttainmentGrade';

import { getFormulaImplementation } from '../formulas';
import { CourseInstanceRoleType } from '../types/course';
import { ApiError } from '../types/error';
import { Formula, FormulaNode, GradingInput, GradingResult, Status } from '../types/formulas';
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
 * @throws {ApiError} - If CSV file loading fails, parsing the header or body of the CSV fails, or
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

/**
 * Recursively calculates the grade for a particular attainment by its formula
 * node.
 *
 * TODO: Save calculated grades to the database.
 */
async function calculateFormulaNode(
  formulaNode: FormulaNode,
  presetGrades: Map<FormulaNode, number>
): Promise<GradingResult> {
  /*
   * If a teacher has manually specified a grade for this attainment,
   * the manually specified grade will be used.
   *
   * A grade has to be manually specified when using the 'Manual' formula
   * and a grade may be manually specified for overriding grade calculation
   * functions in special cases.
   */
  const presetGrade: number | undefined = presetGrades.get(formulaNode);
  if (presetGrade) {
    return {
      status: Status.Pass,
      grade: presetGrade
    };
  }

  /*
   * A teacher has not manually specified a grade for this attainment, therefore
   * the grade will be calculated based on the given formula and the grades
   * from this attainment's subattainments.
   */

  // Inputs for the formula of this attainment.
  const inputs: Array<GradingInput> = [];

  // First, recursively calculate the grades the subattainments.
  for (const subFormulaNode of formulaNode.subFormulaNodes) {
    const input: GradingInput = {
      subResult: await calculateFormulaNode(subFormulaNode, presetGrades),
      params: subFormulaNode.parentFormulaParams
    };

    inputs.push(input);
  }

  // Then, calculate the grade of this attainment using the formula specified
  // for this attainment and the grades of the subattainments.
  return await formulaNode.formulaImplementation.formulaFunction(inputs);
}

interface UserAttainmentGradeWithUser extends UserAttainmentGrade {
  User: User
}

export async function calculateGrades(
  req: Request,
  res: Response
): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  validateCourseAndInstance(courseId, courseInstanceId);

  /*
   * First we need to get all the attainments in this course instance.
   */

  interface AttainmentInfo {
    id: number,
    parentId: number,
    formula: Formula | null,
    parentFormulaParams: object | null
  }

  const attainments: Array<AttainmentInfo> = await Attainable.findAll({
    raw: true,
    where: {
      courseId,
      courseInstanceId,
    },
    attributes: [
      'id',
      // Translates attainableId to parentId.
      // TODO: Rename in model if possible.
      ['attainable_id', 'parentId'],
      'formula',
      'parentFormulaParams',
    ],
    // Cast to unknown is required because AttainmentInfo does not extend the
    // model type.
  }) as unknown as Array<AttainmentInfo>;

  /*
   * Then we need to find the formulas used to calculate the grade of each
   * attainment.
   *
   * For each attainment, we will construct a formula node object containing:
   *   - The formula implementation storing the actual formula function as well
   *     as the Yup schema for validating its parameters.
   *   - The formula nodes of the subattainments of this attainment.
   *   - The formula parameters needed for calculating the grade of this
   *     attainment's parent attainment.
   */

  /*
   * Stores the formula nodes of each attainment.
   * Attainment ID -> Formula node of the given attainment.
   */
  const formulaNodesByAttainmentId: Map<number, FormulaNode> = new Map();

  /*
   * First find the formula implementation and formula parameters for the parent
   * attainment's formula.
   */
  for (const attainment of attainments) {
    const formula: Formula | null = attainment.formula;

    // Ensure that the formula specified for this attainment is valid.
    if (!yup.string().oneOf(Object.values(Formula)).required().validate(formula)) {
      throw new ApiError(
        `invalid formula ${formula} for attainment with ID ${attainment.id}`,
        HttpCode.InternalServerError
      );
    }

    formulaNodesByAttainmentId.set(attainment.id, {
      formulaImplementation: await getFormulaImplementation(formula as Formula),
      subFormulaNodes: [],
      parentFormulaParams: attainment.parentFormulaParams
    });
  }

  /*
   * Then we will find the formula nodes of each attainment's subattainments.
   * This will construct a tree structure, and a reference to the root of this
   * tree is stored in the rootFormulaNode variable.
   */
  let rootFormulaNode: FormulaNode | null = null;

  /*
   * Local utility function to get a formula node from formulaNodesByAttainmentId
   * as type FormulaNode, or throw an error if the formula node is undefined.
   */
  function getFormulaNode(attainmentId: number): FormulaNode {
    const formulaNode: FormulaNode | undefined = formulaNodesByAttainmentId.get(attainmentId);

    if (!formulaNode) {
      throw new ApiError(
        `found undefined formula node for attainment with ID ${attainmentId}`,
        HttpCode.InternalServerError
      );
    }

    return formulaNode;
  }

  for (const attainment of attainments) {
    const formulaNode: FormulaNode = getFormulaNode(attainment.id);

    /*
     * Check whether this attainment is the root attainment. The root attainment
     * has no parent.
     */
    if (attainment.parentId === null) {
      /*
       * This attainment is the root attainment. Store a reference to its formula
       * node in the rootFormulaNode variable.
       */

      // There should only be one root attainment.
      if (rootFormulaNode) {
        throw new ApiError(
          'duplicate root attainment',
          HttpCode.InternalServerError
        );
      }

      rootFormulaNode = formulaNode;
    } else {
      /*
       * This attainment is not the root attainment. So we will get its parent
       * attainment's formula node and add this attainment's formula node to
       * the parent's list of sub formula nodes.
       */

      const parentFormulaNode: FormulaNode = getFormulaNode(attainment.parentId);

      /*
       * Ensure that the parent formula parameters specified for this attainment
       * match the schema of the parent attainment's formula.
       */
      await parentFormulaNode.formulaImplementation.paramSchema.validate(
        formulaNode.parentFormulaParams
      );

      parentFormulaNode.subFormulaNodes.push(formulaNode);
    }
  }

  /*
   * If rootFormulaNode is still null, then no root attainment was found. This
   * is a conflict, and we are unable to calculate the grades of this course
   * instance.
   */
  if (!rootFormulaNode) {
    throw new ApiError(
      'no root attainment found for this course instance; maybe there is a cycle',
      HttpCode.Conflict
    );
  }

  /*
   * Now we know which formula to use to calculate the grade of each attainment
   * as well as their parameters.
   *
   * Next we need to find the grades already manually specified by a teacher to
   * use as a basis to calculate grades.
   */

  /*
   * Stores the grades of each student for each attainment which were manually
   * specified by a teacher.
   */
  const unorganizedPresetGrades: Array<{
    studentNumber: string,
    grade: number,
    attainmentId: number
  }> = (await UserAttainmentGrade.findAll({
    include: [
      {
        model: Attainable,
        required: true,
        attributes: [],
        where: {
          courseId,
          courseInstanceId,
        }
      },
      {
        model: User,
        required: true,
        attributes: ['studentId']
      }
    ],
    attributes: ['grade', 'attainableId'],
  }) as Array<UserAttainmentGradeWithUser>).map(
    (attainmentGrade: UserAttainmentGradeWithUser) => {
      return {
        studentNumber: attainmentGrade.User.studentId,
        grade: attainmentGrade.grade,
        attainmentId: attainmentGrade.attainableId
      };
    }
  );

  /*
   * Next we'll organize the preset grades by student number.
   */

  /*
   * Store the preset grades of all attainments per student. Stores all the
   * same information as unorganizedPresetGrades.
   * Student number -> Formula node -> Preset grade.
   */
  const organizedPresetGrades: Map<string, Map<FormulaNode, number>> = new Map();

  for (const presetGrade of unorganizedPresetGrades) {
    let userPresetGrades: Map<FormulaNode, number> | undefined =
      organizedPresetGrades.get(presetGrade.studentNumber);

    if (!userPresetGrades) {
      userPresetGrades = new Map();
      organizedPresetGrades.set(presetGrade.studentNumber, userPresetGrades);
    }

    userPresetGrades.set(
      getFormulaNode(presetGrade.attainmentId),
      presetGrade.grade
    );
  }

  /*
   * Finally we're ready to calculate the grades of each student starting from
   * the root attainment.
   */

  const finalGrades: Array<{
    studentNumber: string,
    grade: number,
    status: Status
  }> = [];

  for (const [studentNumber, presetGrades] of organizedPresetGrades) {
    const finalGrade: GradingResult =
      await calculateFormulaNode(rootFormulaNode, presetGrades);

    finalGrades.push(
      {
        studentNumber: studentNumber,
        grade: finalGrade.grade,
        status: finalGrade.status
      }
    );
  }

  /*
   * TODO: Don't return final grades, save grades to database in
   * calculateFormulaNode instead?
   */

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      grades: finalGrades
    }
  });
}
