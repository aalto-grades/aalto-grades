// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { parse, Parser } from 'csv-parse';
import { NextFunction, Request, Response } from 'express';
import * as yup from 'yup';

import Attainable from '../database/models/attainable';
import User from '../database/models/user';
import UserAttainmentGrade from '../database/models/userAttainmentGrade';

import { getFormulaImplementation } from '../formulas';
import { ApiError } from '../types/error';
import { Formula, FormulaNode, GradingInput, GradingResult, Status } from '../types/formulas';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { validateCourseAndInstance } from './utils/courseInstance';

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
  const csvData: Array<Array<string>> = [];

  // TODO: should user be allowed to define delimiter in the request.
  const parser: Parser = parse({
    delimiter: ','
  });

  parser
    .on('readable', function (): void {
      let row: Array<string>;
      while ((row = parser.read()) !== null) {
        csvData.push(row);
      }
    })
    .on('error', function (err: unknown): void {
      // Pass the error manually to the error handler, controllerDispatcher will not catch here.
      next(err);
    })
    .on('end', function (): void {

      /**
       * TODO:
       * - Check students exists in the database, create new entries if needed.
       * - Check attainments exists in the database.
       * - Add the grading data to the database.
       */
      console.log('CSV:', csvData);

      res.status(HttpCode.Ok).json({
        success: true,
        data: {}
      });
      return;
    });

  // Write stringified CSV data to the csv-parser's stream.
  parser.write(data);

  // Close the readable stream once data reading finished.
  parser.end();
}

// TODO: Save calculated grades to the database.
async function calculateFormulaNode(
  formulaNode: FormulaNode,
  presetGrades: Map<FormulaNode, number>
): Promise<GradingResult> {
  if (presetGrades.has(formulaNode)) {
    // If a teacher has manually specified a grade for a this attainment,
    // the manually specified grade will be used. A grade has to be manually
    // specified when using the 'Manual' formula and to allow for overriding
    // grade calculation functions in special cases.
    return {
      status: Status.Pass,

      // We already checked this is defined.
      grade: presetGrades.get(formulaNode)! // eslint-disable-line
    };
  }

  // A teacher has not manually specified a grade for this attainment, therefore
  // the grade will be calculated based on the given formula and the grades
  // from this attainment's subattainments.

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

  // Get all attainments in this course instance.
  const attainments: Array<{
    id: number,
    attainableId: number, // ID of parent attainment
    formulaId: Formula | null,
    formulaParams: object | null,
  }> = await Attainable.findAll({
    where: {
      courseId,
      courseInstanceId,
    },
    attributes: [
      'id',
      'attainableId',
      'formulaId',
      'formulaParams',
    ],
  });

  // Attainment ID -> Formula used to calculate the grade of the given attainment.
  const formulaNodesByAttainmentId: Map<number, FormulaNode> = new Map();
  let rootFormulaNode: FormulaNode | null = null;

  // Collect all attainment formulas into the formulaNodesByAttainmentId Map.
  for (const attainment of attainments) {
    const formulaId: Formula | null = attainment.formulaId;

    // Ensure that the formula specified for this attainment is valid.
    if (!yup.string().oneOf(Object.values(Formula)).required().validate(formulaId)) {
      throw new ApiError(
        `invalid formula ${formulaId} for attainment with ID ${attainment.id}`,
        HttpCode.InternalServerError
      );
    }

    formulaNodesByAttainmentId.set(attainment.id, {
      formulaImplementation: await getFormulaImplementation(formulaId as Formula),
      subFormulaNodes: [],
      parentFormulaParams: attainment.formulaParams
    });
  }

  // Build the tree structure of FormulaNodes using the Map by iterating again.
  for (const attainment of attainments) {
    const formulaNode: FormulaNode | undefined = formulaNodesByAttainmentId.get(attainment.id);

    if (!formulaNode) {
      throw new ApiError(
        `found undefined formula node for attainment with ID ${attainment.id}`,
        HttpCode.InternalServerError
      );
    }

    if (attainment.attainableId === null) { // parent ID
      if (rootFormulaNode) {
        throw new ApiError(
          'duplicate root attainment',
          HttpCode.InternalServerError
        );
      }

      rootFormulaNode = formulaNode;
    } else {
      const parentFormulaNode: FormulaNode | undefined =
        formulaNodesByAttainmentId.get(attainment.attainableId);

      if (!parentFormulaNode) {
        throw new ApiError(
          `found undefined formula node for attainment with ID ${attainment.id}`,
          HttpCode.InternalServerError
        );
      }

      // Ensure that the formula params match formula of the parent attainment.
      await parentFormulaNode.formulaImplementation.paramSchema.validate(
        formulaNode.parentFormulaParams
      );

      parentFormulaNode.subFormulaNodes.push(formulaNode);
    }
  }

  if (!rootFormulaNode) {
    throw new ApiError(
      'no root attainment found for this course instance; maybe there is a cycle',
      HttpCode.BadRequest
    );
  }

  const presetGrades: Array<{
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

  // Student number -> formula node -> preset grade
  const presetGradesByStudentNumber: Map<string, Map<FormulaNode, number>> = new Map();

  for (const presetGrade of presetGrades) {
    if (!presetGradesByStudentNumber.has(presetGrade.studentNumber)) {
      presetGradesByStudentNumber.set(presetGrade.studentNumber, new Map());
    }

    // TODO: Find a sensible way to avoid non-null assertion?
    const userPresetGrades: Map<FormulaNode, number> =
      presetGradesByStudentNumber.get(presetGrade.studentNumber)!; // eslint-disable-line

    // TODO: Avoid non-null assertion?
    userPresetGrades.set(
      formulaNodesByAttainmentId.get(presetGrade.attainmentId)!, // eslint-disable-line
      presetGrade.grade
    );
  }

  const rootAttainmentGradesByStudentNumber: Map<string, GradingResult> = new Map();
  for (const [studentNumber, presetGrades] of presetGradesByStudentNumber) {
    rootAttainmentGradesByStudentNumber.set(
      studentNumber,
      await calculateFormulaNode(rootFormulaNode, presetGrades)
    );
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      grades: Array.from(rootAttainmentGradesByStudentNumber)
        .map(([studentNumber, result]: [string, GradingResult]) => {
          return {
            studentNumber: studentNumber,
            grade: result.grade,
            status: result.status,
          };
        })
    }
  });
}
