// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, FinalGrade, Formula, Status } from 'aalto-grades-common/types';
import { parse, Parser } from 'csv-parse';
import { stringify } from 'csv-stringify';
import { NextFunction, Request, Response } from 'express';
import { Includeable, Op, QueryTypes, Transaction } from 'sequelize';
import * as yup from 'yup';

import { sequelize } from '../database';
import AssessmentModel from '../database/models/assessmentModel';
import Attainment from '../database/models/attainment';
import AttainmentGrade from '../database/models/attainmentGrade';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import User from '../database/models/user';

import { getFormulaImplementation } from '../formulas';
import {
  ApiError, CalculationResult, FormulaNode,HttpCode, JwtClaims, StudentGrades
} from '../types';
import { validateAssessmentModelPath } from './utils/assessmentModel';
import { isTeacherInChargeOrAdmin } from './utils/user';

async function studentNumbersExist(studentNumbers: Array<string>): Promise<void> {
  const foundStudentNumbers: Array<string> = (await User.findAll({
    attributes: ['studentNumber'],
    where: {
      studentNumber: {
        [Op.in]: studentNumbers
      }
    }
  })).map((student: User) => student.studentNumber);

  if (foundStudentNumbers.length !== studentNumbers.length) {
    const errors: Array<string> = [];

    for (const studentNumber of studentNumbers) {
      if (!foundStudentNumbers.includes(studentNumber)) {
        errors.push(`user with student number ${studentNumber} not found`);
      }
    }

    throw new ApiError(errors, HttpCode.UnprocessableEntity);
  }
}

export async function getCsvTemplate(req: Request, res: Response): Promise<void> {
  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId, req.params.assessmentModelId
    );

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id, HttpCode.Forbidden);

  const attainmentTags: Array<string> = (await Attainment.findAll({
    attributes: ['tag'],
    where: {
      assessmentModelId: assessmentModel.id
    }
  })).map((attainment: { tag: string }) => attainment.tag);

  if (attainmentTags.length === 0) {
    throw new ApiError(
      `no attainments found for assessment model with ID ${assessmentModel.id}, `
        + 'add attainments to the assessment model to generate a template',
      HttpCode.NotFound
    );
  }

  const template: Array<Array<string>> = [
    ['StudentNo', ...attainmentTags]
  ];

  stringify(
    template,
    {
      delimiter: ','
    },
    (_err: unknown, data: string) => {
      res
        .status(HttpCode.Ok)
        .setHeader('Content-Type', 'text/csv')
        .attachment(`course_${course.courseCode}_grading_template.csv`)
        .send(data);
      return;
    }
  );
}

/**
 * The final grade for a student in a form returned by a database query.
 */
interface FinalGradeRaw extends AttainmentGrade {
  Attainment: {
    AssessmentModel: {
      Course: {
        maxCredits: number
      }
    }
  },
  User: {
    studentNumber: string
  }
}

async function getFinalGradesFor(
  assessmentModelId: number,
  studentNumbers: Array<string>,
  skipErrorOnEmpty: boolean = false
): Promise<Array<FinalGradeRaw>> {

  // Prepare base query options for User.
  const userQueryOptions: Includeable = {
    model: User,
    attributes: ['studentNumber']
  };

  // Conditionally add the where clause if student numbers included.
  if (studentNumbers.length !== 0) {
    userQueryOptions.where = {
      studentNumber: {
        [Op.in]: studentNumbers
      }
    };
  }

  const finalGrades: Array<FinalGradeRaw> = await AttainmentGrade.findAll({
    attributes: ['grade'],
    include: [
      {
        model: Attainment,
        where: {
          assessmentModelId: assessmentModelId,
          parentId: null
        },
        include: [
          {
            model: AssessmentModel,
            include: [
              {
                model: Course,
                attributes: ['maxCredits']
              }
            ]
          }
        ]
      },
      userQueryOptions
    ]
  }) as Array<FinalGradeRaw>;

  if (finalGrades.length === 0 && !skipErrorOnEmpty) {
    throw new ApiError(
      'no grades found, make sure grades have been ' +
      'imported/calculated before requesting course results',
      HttpCode.NotFound
    );
  }

  return finalGrades;
}

interface InstanceWithUsers extends CourseInstance {
  Users: Array<User>
}

async function filterByInstanceAndStudentNumber(
  instanceId: number,
  studentNumbersFiltered: Array<string> | undefined
): Promise<Array<string> | undefined> {
  const studentsFromInstance: InstanceWithUsers | null = await CourseInstance.findOne({
    attributes: ['id'],
    where: {
      id: instanceId
    },
    include: [
      {
        model: User,
        attributes: ['studentNumber']
      }
    ]
  }) as InstanceWithUsers;

  if (studentsFromInstance) {
    const studentNumbersFromInstance: Array<string> =
        studentsFromInstance.Users.map((user: User) => user.studentNumber);

    if (studentNumbersFiltered) {
      // Intersection of both student numbers from query params and on the course instance.
      return studentNumbersFiltered.filter(
        (value: string) => studentNumbersFromInstance.includes(value)
      );
    } else {
      // Only student numbers from instance.
      return studentNumbersFromInstance;
    }
  }

  return studentNumbersFiltered;
}

/**
 * Get grading data formatted to Sisu compatible format for exporting grades to Sisu.
 * Documentation and requirements for Sisu CSV file structure available at
 * https://wiki.aalto.fi/display/SISEN/Assessment+of+implementations
 * @param {Request} req - The HTTP request.
 * @param {Response} res - The HTTP response containing the CSV file.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If course and/or course instance not found, instance does not belong to
 * the course, or no course results found/calculated before calling the endpoint.
*/
export async function getSisuFormattedGradingCSV(req: Request, res: Response): Promise<void> {
  const urlParams: yup.AnyObjectSchema = yup.object({
    assessmentDate: yup
      .date()
      .notRequired(),
    completionLanguage: yup
      .string()
      .transform((value: string, originalValue: string) => {
        return originalValue ? originalValue.toLowerCase() : value;
      })
      // All Sisu accepted language codes.
      .oneOf(['fi', 'sv', 'en', 'es', 'ja', 'zh', 'pt', 'fr', 'de', 'ru'])
      .notRequired(),
    studentNumbers: yup
      .array()
      .json()
      .of(yup.string())
      .notRequired(),
    instanceId: yup
      .number()
      .min(1)
      .notRequired()
  });

  const { assessmentDate, completionLanguage, studentNumbers, instanceId }: {
    assessmentDate?: Date,
    completionLanguage?: string,
    studentNumbers?: Array<string>,
    instanceId?: number
  } = await urlParams.validate(req.query, { abortEarly: false });

  let studentNumbersFiltered: Array<string> | undefined = studentNumbers;

  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId, req.params.assessmentModelId
    );

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id, HttpCode.Forbidden);

  // Include students from a particular instance if an ID is provided.
  if (instanceId) {
    studentNumbersFiltered = await filterByInstanceAndStudentNumber(
      instanceId, studentNumbersFiltered
    );
  }

  if (studentNumbersFiltered)
    studentNumbersExist(studentNumbersFiltered);

  /**
   * TODO:
   * - only one grade per user per instance is allowed,
   *   what if grades are recalculated, should we keep track of old grades?
   */

  const finalGrades: Array<FinalGradeRaw> = await getFinalGradesFor(
    assessmentModel.id, studentNumbersFiltered ?? []
  );

  const courseResults: Array<{
    studentNumber: string,
    grade: string,
    credits: number,
    assessmentDate: string,
    completionLanguage: string,
    comment: string
  }> = finalGrades.map(
    (finalGrade: FinalGradeRaw) => {
      return {
        studentNumber: finalGrade.User.studentNumber,
        grade: String(finalGrade.grade),
        credits: finalGrade.Attainment.AssessmentModel.Course.maxCredits,
        // Assesment date must be in form dd.mm.yyyy.
        assessmentDate: (
          assessmentDate ? new Date(assessmentDate) : new Date(Date.now())
        ).toLocaleDateString('fi-FI'),
        completionLanguage: completionLanguage ?? 'en',
        // Comment column is required, but can be empty.
        comment: ''
      };
    }
  );

  stringify(
    courseResults,
    {
      header: true,
      delimiter: ',' // NOTE, accepted delimiters in Sisu are semicolon ; and comma ,
    },
    (_err: unknown, data: string) => {
      res
        .status(HttpCode.Ok)
        .setHeader('Content-Type', 'text/csv')
        .attachment(
          `final_grades_course_${course.courseCode}_${(new Date()).toLocaleDateString('fi-FI')}.csv`
        )
        .send(data);
      return;
    });
}

/**
 * Get course instance final grading data in JSON format.
 * @param {Request} req - The HTTP request.
 * @param {Response} res - The HTTP response containing the CSV file.
 * @returns {Promise<void>} - A Promise that resolves when the function has completed its execution.
 * @throws {ApiError} - If course and/or course instance not found, instance does not belong to
 * the course, or no course results found/calculated before calling the endpoint.
*/
export async function getFinalGrades(req: Request, res: Response): Promise<void> {
  const urlParams: yup.AnyObjectSchema = yup.object({
    studentNumbers: yup
      .array()
      .json()
      .of(yup.string())
      .notRequired(),
    instanceId: yup
      .number()
      .min(1)
      .notRequired()
  });

  const { studentNumbers, instanceId }: {
    studentNumbers?: Array<string>
    instanceId?: number
  } = await urlParams.validate(req.query, { abortEarly: false });

  let studentNumbersFiltered: Array<string> | undefined = studentNumbers;

  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId, req.params.assessmentModelId
    );

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id, HttpCode.Forbidden);

  // Include students from particular instance (belonging to the assessment model) if ID provided.
  if (instanceId) {
    studentNumbersFiltered = await filterByInstanceAndStudentNumber(
      instanceId, studentNumbersFiltered
    );
  }

  if (studentNumbersFiltered)
    studentNumbersExist(studentNumbersFiltered);

  let finalGrades: Array<FinalGrade> = [];

  // User raw query to enable distinct selection of students who have
  // at least one grade (final or not) for particular assessment model.
  const allStudentsFromAssessmentModel: Array<string> = (await sequelize.query(
    `SELECT DISTINCT student_number
    FROM attainment_grade
    INNER JOIN attainment ON attainment.id = attainment_grade.attainment_id
    INNER JOIN "user" ON "user".id = attainment_grade.user_id
    WHERE attainment.assessment_model_id = :assessmentModelId`,
    {
      replacements: { assessmentModelId: assessmentModel.id },
      type: QueryTypes.SELECT
    }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  )).map((value: any) => value.student_number);

  if (studentNumbersFiltered && allStudentsFromAssessmentModel.length !== 0) {
    studentNumbersFiltered = allStudentsFromAssessmentModel.filter(
      (value: string) => (studentNumbersFiltered as Array<string>).includes(value)
    );
  }

  const studentsWithFinalGrades: Array<FinalGradeRaw> = await getFinalGradesFor(
    assessmentModel.id, studentNumbersFiltered ?? [], allStudentsFromAssessmentModel.length !== 0
  );

  // Add students with no final grade marked as pending to the results.
  if (allStudentsFromAssessmentModel.length !== 0) {

    const studentNumbersWithFinalGrades: Array<string> =
      studentsWithFinalGrades.map((value: FinalGradeRaw) => value.User.studentNumber);

    const studentNumbersNoGrade: Array<string> = allStudentsFromAssessmentModel
      .filter((studentNumber: string) => {
        return !studentNumbersWithFinalGrades.includes(studentNumber);
      });

    studentNumbersNoGrade.forEach((studentNumber: string) => {
      finalGrades.push({
        studentNumber,
        grade: Status.Pending,
        credits: 0
      });
    });
  }

  studentsWithFinalGrades.map(
    (finalGrade: FinalGradeRaw) => {
      finalGrades.push({
        studentNumber: finalGrade.User.studentNumber,
        grade: String(finalGrade.grade),
        credits: finalGrade.Attainment.AssessmentModel.Course.maxCredits
      });
    }
  );

  if (studentNumbersFiltered) {
    finalGrades = finalGrades.filter(
      (value: FinalGrade) => (studentNumbersFiltered as Array<string>).includes(value.studentNumber)
    );
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      finalGrades
    }
  });
}

/**
 * Parse and extract attainment IDs from the CSV file header.
 * Correct format: "StudentNumber,exam,exercise,project,..."
 * @param {Array<string>} header - Header part of the CSV file.
 * @param {number} assessmentModelId - ID of the assessment model grades are
 * being added to.
 * @returns {Promise<Array<number>>} - Array containing the IDs of attainments.
 * @throws {ApiError} - If first column not "StudentNumber" (case-insensitive)
 * header array is empty or any of the attainment tags malformed or missing.
 */
export async function parseHeaderFromCsv(
  header: Array<string>, assessmentModelId: number
): Promise<Array<number>> {
  const errors: Array<string> = [];

  // Remove first input "StudentNumber". Avoid using shift(), which will have
  // side-effects outside this function.
  const attainmentTags: Array<string> = header.slice(1);

  if (attainmentTags.length === 0) {
    throw new ApiError(
      'No attainments found from the header, please upload valid CSV.',
      HttpCode.BadRequest
    );
  }

  interface IdAndTag {
    id: number,
    tag: string
  }

  const attainments: Array<IdAndTag> = await Attainment.findAll({
    attributes: ['id', 'tag'],
    where: {
      [Op.and]: [
        {
          assessmentModelId: assessmentModelId
        },
        {
          tag: {
            [Op.in]: attainmentTags
          }
        }
      ]
    }
  });

  if (attainmentTags.length > attainments.length) {
    for (const attainmentTag of attainmentTags) {
      if (!attainments.find((attainment: IdAndTag) => attainment.tag === attainmentTag)) {
        errors.push(
          'Header attainment data parsing failed at column '
            + `${attainmentTags.indexOf(attainmentTag) + 2}. `
            + `Could not find an attainment with tag ${attainmentTag} in `
            + `assessment model with ID ${assessmentModelId}.`
        );
      }
    }
  }

  const attainmentIds: Array<number> = attainments.map((attainment: IdAndTag) => {
    return attainment.id;
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
   *        | column 1      | column 2 | column 3 |
   *  ---------------------------------------------
   *  row 1:| StudentNumber | exercise | exam     |
   *  row 2:| 812472        | 12       | 32       |
   *  row 3:| 545761        | 0        | 15       |
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
        const grade: AttainmentGradeData = {
          attainmentId: attainmentIds[i],
          grade: parseInt(gradingData[i], 10),
          manual: true,
          status: Status.Pass // TODO: Allow specification?
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
  /** TODO: Check grading points are not higher than max points of the attainment. */

  const grader: JwtClaims = req.user as JwtClaims;

  // Validation path parameters.
  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId, req.params.assessmentModelId
    );

  await isTeacherInChargeOrAdmin(grader, course.id, HttpCode.Forbidden);

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
        // Header having colum information, e.g., "StudentNumber,exam,exercise,project,..."
        const header: Array<string> = studentGradingData.shift() as Array<string>;

        // Parse header and grades separately. Always first parse header before
        // parsing the grades as the grade parser needs the attainment id array.
        const attainmentIds: Array<number> = await parseHeaderFromCsv(
          header, assessmentModel.id
        );

        let parsedStudentData: Array<StudentGrades> = parseGradesFromCsv(
          studentGradingData, attainmentIds
        );

        // Check all users (students) exists in db, create new users if needed.
        const studentNumbers: Array<string> = parsedStudentData.map(
          (student: StudentGrades) => student.studentNumber
        );

        let students: Array<User> = await User.findAll({
          attributes: ['id', 'studentNumber'],
          where: {
            studentNumber: {
              [Op.in]: studentNumbers
            }
          }
        });

        const foundStudents: Array<string> = students.map(
          (student: User) => student.studentNumber
        );
        const nonExistingStudents: Array<string> = studentNumbers.filter(
          (id: string) => !foundStudents.includes(id)
        );

        await sequelize.transaction(async (t: Transaction) => {
          // Create new users (students) if any found from the CSV.
          if (nonExistingStudents.length > 0) {
            const newUsers: Array<User> = await User.bulkCreate(
              nonExistingStudents.map((studentNumber: string) => {
                return {
                  studentNumber: studentNumber
                };
              }), { transaction: t }
            );
            students = students.concat(newUsers);
          }
        });

        // At this point all students confirmed to exist in the database.

        // Add users' database IDs to parsedStudentData based on student number.
        parsedStudentData = parsedStudentData.map(
          (student: StudentGrades): StudentGrades => {
            const matchingUser: User = students.find(
              (user: User) => user.dataValues.studentNumber === student.studentNumber
            ) as User;

            return {
              ...student,
              id: matchingUser.id
            };
          });

        // Use studentsWithId to update attainments by flatmapping each
        // students grades into a one array of all the grades.
        const preparedBulkCreate: Array<AttainmentGradeData> = parsedStudentData.flatMap(
          (student: StudentGrades): Array<AttainmentGradeData> => {
            const studentGradingData: Array<AttainmentGradeData> = student.grades.map(
              (grade: AttainmentGradeData): AttainmentGradeData => {
                return {
                  userId: student.id as number,
                  graderId: grader.id,
                  ...grade
                };
              });
            return studentGradingData;
          });

        // TODO: Optimize if datasets are big.
        await AttainmentGrade.bulkCreate(
          preparedBulkCreate, { updateOnDuplicate: ['grade', 'graderId'] }
        );

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

export async function calculateGrades(
  req: Request,
  res: Response
): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    studentNumbers: yup
      .array()
      .of(yup.string())
      .notRequired(),
    instanceId: yup
      .number()
      .min(1)
      .notRequired()
  }).test(
    (value: {
      studentNumbers?: yup.Maybe<Array<string | undefined> | undefined>,
      instanceId?: yup.Maybe<number | undefined>
    }) => {
      if (!value.instanceId && !value.studentNumbers) {
        throw new ApiError(
          'You must provide at least one of: instanceId or list of student numbers',
          HttpCode.BadRequest
        );
      }
      return true;
    }
  );

  const { studentNumbers, instanceId }: {
    studentNumbers?: Array<string>
    instanceId?: number
  } = await requestSchema.validate(req.body, { abortEarly: false });

  let studentNumbersFiltered: Array<string> | undefined = studentNumbers;
  const grader: JwtClaims = req.user as JwtClaims;

  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateAssessmentModelPath(
      req.params.courseId, req.params.assessmentModelId
    );

  await isTeacherInChargeOrAdmin(grader, course.id, HttpCode.Forbidden);

  // Include students from particular instance (belonging to the assessment model) if ID provided.
  if (instanceId) {
    studentNumbersFiltered = await filterByInstanceAndStudentNumber(
      instanceId, studentNumbersFiltered
    );
  }

  if (studentNumbersFiltered && studentNumbersFiltered.length !== 0) {
    // Ensure that all students to be included in the calculation exist in the database.
    studentNumbersExist(studentNumbersFiltered);
  } else {
    throw new ApiError(
      `No student numbers found from instance ID ${instanceId}`, HttpCode.NotFound
    );
  }

  /*
   * Get all the attainments in this assessment model.
   */

  const attainments: Array<Attainment> = await Attainment.findAll({
    raw: true,
    where: {
      assessmentModelId: assessmentModel.id
    }
  });

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
    const formula: Formula = attainment.formula;

    formulaNodesByAttainmentId.set(attainment.id, {
      formulaImplementation: getFormulaImplementation(formula as Formula),
      subFormulaNodes: [],
      formulaParams: attainment.formulaParams,
      attainmentId: attainment.id,
      attainmentTag: attainment.tag
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
      'no root attainment found for this assessment model; maybe there is a cycle',
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
  const unorganizedPresetGrades: Array<AttainmentGrade> = await AttainmentGrade.findAll({
    include: [
      {
        model: Attainment,
        required: true,
        attributes: [],
        where: {
          assessmentModelId: assessmentModel.id
        },
      },
      {
        model: User,
        required: true,
        attributes: [],
        where: {
          studentNumber: {
            [Op.in]: studentNumbersFiltered
          }
        }
      }
    ],
    attributes: ['grade', 'attainmentId', 'userId'],
  });

  /*
   * Next we'll organize the preset grades by user ID.
   */

  /*
   * Store the preset grades of all attainments per student. Stores all the
   * same information as unorganizedPresetGrades.
   * User ID -> Formula node -> Preset grade.
   */
  const organizedPresetGrades: Map<number, Map<FormulaNode, number>> = new Map();

  for (const presetGrade of unorganizedPresetGrades) {
    let userPresetGrades: Map<FormulaNode, number> | undefined =
      organizedPresetGrades.get(presetGrade.userId);

    if (!userPresetGrades) {
      userPresetGrades = new Map();
      organizedPresetGrades.set(presetGrade.userId, userPresetGrades);
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

  const calculatedGrades: Array<AttainmentGradeData> = [];

  /*
   * Recursively calculates the grade for a particular attainment by its formula
   * node.
   */
  function calculateFormulaNode(
    userId: number,
    formulaNode: FormulaNode,
    presetGrades: Map<FormulaNode, number>
  ): CalculationResult {
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
        attainmentTag: formulaNode.attainmentTag,
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
    const subGrades: Array<CalculationResult> = [];

    // First, recursively calculate the grades the subattainments.
    for (const subFormulaNode of formulaNode.subFormulaNodes) {
      subGrades.push(calculateFormulaNode(userId, subFormulaNode, presetGrades));
    }

    // Then, calculate the grade of this attainment using the formula specified
    // for this attainment and the grades of the subattainments.
    const calculated: CalculationResult =
      formulaNode.formulaImplementation.formulaFunction(
        formulaNode.attainmentTag, formulaNode.formulaParams, subGrades
      );

    calculatedGrades.push(
      {
        userId: userId,
        attainmentId: formulaNode.attainmentId,
        graderId: grader.id,
        grade: calculated.grade,
        status: calculated.status,
        manual: false
      }
    );

    return calculated;
  }

  for (const [userId, presetGrades] of organizedPresetGrades) {
    calculateFormulaNode(userId, rootFormulaNode, presetGrades);
  }

  await sequelize.transaction(async (transaction: Transaction) => {
    await AttainmentGrade.bulkCreate(calculatedGrades,
      {
        updateOnDuplicate: ['grade', 'graderId', 'status'],
        transaction
      }
    );
  });

  res.status(HttpCode.Ok).json({
    success: true,
    data: {}
  });
}
