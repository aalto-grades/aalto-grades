// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { parse, Parser } from 'csv-parse';
import { NextFunction, Request, Response } from 'express';

import Attainable from '../database/models/attainable';
import UserAttainmentGrade from '../database/models/userAttainmentGrade';

import { formulaChecker, getFormula } from '../formulas';
import { ApiError } from '../types/error';
import {
  CalculationResult,
  Formula,
  FormulaNode,
  FormulaParams,
  Status
} from '../types/formulas';
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

async function calculateSingleNode(
  tree: FormulaNode,
  presetGrades: Map<FormulaNode, number>
): Promise<CalculationResult> {
  if (presetGrades.has(tree)) {
    // If a teacher has manually specified a grade for a this attainment,
    // the manually specified grade will be used. A grade has to be manually
    // specified when using the 'Manual' formula and to allow for overriding
    // grade calculation functions in special cases.
    return {
      status: Status.Pass,
      grade: presetGrades.get(tree)
    };
  }

  // A teacher has not manually specified a grade for this attainment, therefore
  // the grade will be calculated based on the given formula and the grades
  // from this attainment's subattainments.

  // First, recursively calculate the grades the subattainments.
  const subGrades: Array<CalculationResult> =
    await Promise.all(
      tree.subFormulaNodes.map(
        (subTree: FormulaNode) => calculateSingleNode(subTree, presetGrades)
      )
    );

  // Then, calculate the grade of this attainment using the formula specified
  // for this attainment and the grades of the subattainments.
  return await tree.validatedFormula(subGrades);
}

export async function calculateGrades(
  req: Request,
  res: Response
): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  validateCourseAndInstance(courseId, courseInstanceId);

  const formulaNodesByAttainmentId: Map<number, FormulaNode> = new Map();

  const attainables: Array<{
    id: number,
    attainableId: number, // id of parent attainment
    formulaId: Formula | null,
    formulaParams: FormulaParams | null,
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

  let rootAttainable: null | FormulaNode = null;
  // Collect all attainment formulas into a Map.
  for (const attainable of attainables) {
    const formulaId: Formula | null = attainable.formulaId;
    const params: FormulaParams | null = attainable.formulaParams;
    if (!(await formulaChecker.validate(formulaId))) {
      // This invariant should be checked when inputting the parameters
      // for this formula. Hence we throw 500.
      throw new ApiError(
        'the parameters for a formula do not match the schema',
        HttpCode.InternalServerError
      );
    }
    if (params === null) {
      throw new ApiError('the parameters for a formula haven\'t been set', HttpCode.BadRequest);
    }

    formulaNodesByAttainmentId.set(attainable.id, {
      validatedFormula: await getFormula(formulaId as Formula, params),
      subFormulaNodes: [],
    });
  }

  // Build up the tree structure of Formula nodes using the Map by iterating
  // again.
  for (const attainable of attainables) {
    if (attainable.attainableId === null) { // parent id
      if (rootAttainable) {
        // the database is in a conflicting state
        throw new ApiError(
          'duplicate root attainment',
          HttpCode.InternalServerError
        );
      }
      rootAttainable = formulaNodesByAttainmentId.get(attainable.id)!;
    } else {
      formulaNodesByAttainmentId
        .get(attainable.attainableId)!
        .subFormulaNodes
        .push(formulaNodesByAttainmentId.get(attainable.id)!);
    }
  }

  if (!rootAttainable) {
    throw new ApiError(
      'no root attainment for this course instance; maybe there is a cycle',
      HttpCode.BadRequest
    );
  }

  const studentGrades: Array<{
    userId: number,
    grade: number,
    attainableId: number,
  }> = await UserAttainmentGrade.findAll({
    include: { model: Attainable, required: true, attributes: [], where: {
      courseId,
      courseInstanceId,
    }},
    attributes: ['userId', 'grade', 'attainableId'],
  });

  // student id -> formula node -> preset grade
  const presetGradesByStudentId: Map<number, Map<FormulaNode, number>> = new Map();

  for (const student of studentGrades) {
    if (!presetGradesByStudentId.has(student.userId)) {
      presetGradesByStudentId.set(student.userId, new Map());
    }
    presetGradesByStudentId
      .get(student.userId)!
      .set(formulaNodesByAttainmentId.get(student.attainableId)!, student.grade);
  }

  const rootAttainableGradesByStudent: Map<number, CalculationResult> = new Map();
  for (const [studentId, presetGrades] of presetGradesByStudentId) {
    rootAttainableGradesByStudent.set(
      studentId,
      await calculateSingleNode(rootAttainable, presetGrades)
    );
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      grades: Array.from(rootAttainableGradesByStudent)
        .map(([studentId, result]: [number, CalculationResult]) => {
          return {
            studentId,
            grade: result.grade,
            status: result.status,
          };
        })
    }
  });
}
