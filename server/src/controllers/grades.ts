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
  presetPoints: Map<FormulaNode, number>
): Promise<CalculationResult> {
  if (presetPoints.has(tree)) {
    // If the teacher has manually specified a grade for a certain attainment,
    // we should use that instead of re-calculating the grade from lower
    // levels.
    return {
      status: Status.Pass,
      points: presetPoints.get(tree)
    };
  }
  // No preset grade available, so calculate the points for lower nodes.
  const subPoints: Array<CalculationResult> =
    await Promise.all(
      tree.subFormulaNodes.map(
        (subTree: FormulaNode) => calculateSingleNode(subTree, presetPoints)
      )
    );
  // Based on the results from lower nodes, calculate the points for this node
  // using the node-specific formula.
  return await tree.validatedFormula(subPoints);
}

export async function calculateGrades(
  req: Request,
  res: Response
): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });

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

  const studentPoints: Array<{
    userId: number,
    points: number,
    attainableId: number,
  }> = await UserAttainmentGrade.findAll({
    include: { model: Attainable, required: true, attributes: [], where: {
      courseId,
      courseInstanceId,
    }},
    attributes: ['userId', 'points', 'attainableId'],
  });

  // student id -> formula node -> preset points
  const presetPointsByStudentId: Map<number, Map<FormulaNode, number>> = new Map();

  for (const student of studentPoints) {
    if (!presetPointsByStudentId.has(student.userId)) {
      presetPointsByStudentId.set(student.userId, new Map());
    }
    presetPointsByStudentId
      .get(student.userId)!
      .set(formulaNodesByAttainmentId.get(student.attainableId)!, student.points);
  }

  const rootAttainablePointsByStudent: Map<number, CalculationResult> = new Map();
  for (const [studentId, presetPoints] of presetPointsByStudentId) {
    rootAttainablePointsByStudent.set(
      studentId,
      await calculateSingleNode(rootAttainable, presetPoints)
    );
  }

  res.status(HttpCode.Ok)
    .json({
      success: true,
      data: {
        grades: Array.from(rootAttainablePointsByStudent)
          .map(([studentId, result]: [number, CalculationResult]) => {
            return {
              studentId,
              grade: result.points,
              status: result.status,
            };
          })
      }
    });
}
