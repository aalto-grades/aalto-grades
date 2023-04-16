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

  const attainments: Array<{
    id: number,
    parentId: number,
    formula: Formula | null,
    parentFormulaParams: object | null,
  }> = (await Attainable.findAll({
    where: {
      courseId,
      courseInstanceId,
    },
    attributes: [
      'id',
      'attainableId',
      'formula',
      'parentFormulaParams',
    ],
  })).map(
    // TODO: Remove this map() call.
    // map() is called as a temporary measure to translate attainableId to parentId.
    (attainment: Attainable) => {
      return {
        id: attainment.id,
        parentId: attainment.attainableId,
        formula: attainment.formula,
        parentFormulaParams: attainment.parentFormulaParams
      }
    }
  );

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

  // Stores the formula nodes of each attainment.
  // Attainment ID -> Formula node of the given attainment.
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

  for (const attainment of attainments) {
    const formulaNode: FormulaNode | undefined = formulaNodesByAttainmentId.get(attainment.id);

    if (!formulaNode) {
      throw new ApiError(
        `found undefined formula node for attainment with ID ${attainment.id}`,
        HttpCode.InternalServerError
      );
    }

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

      const parentFormulaNode: FormulaNode | undefined =
        formulaNodesByAttainmentId.get(attainment.parentId);

      if (!parentFormulaNode) {
        throw new ApiError(
          `found undefined formula node for attainment with ID ${attainment.parentId}`,
          HttpCode.InternalServerError
        );
      }

      // Ensure that the parent formula parameters specified for this attainment
      // match the schema of the parent attainment's formula.
      await parentFormulaNode.formulaImplementation.paramSchema.validate(
        formulaNode.parentFormulaParams
      );

      parentFormulaNode.subFormulaNodes.push(formulaNode);
    }
  }

  // If rootFormulaNode is still null, then no root attainment was found. This
  // is a conflict, and we are unable to calculate the grades of this course
  // instance.
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

  // Stores the grades of each student for each attainment which were manually
  // specified by a teacher.
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

  // Store the preset grades of all attainments per student. Stores all the
  // same information as unorganizedPresetGrades.
  // Student number -> Formula node -> Preset grade.
  const organizedPresetGrades: Map<string, Map<FormulaNode, number>> = new Map();

  for (const presetGrade of unorganizedPresetGrades) {
    let userPresetGrades: Map<FormulaNode, number> | undefined =
      organizedPresetGrades.get(presetGrade.studentNumber);

    if (!userPresetGrades) {
      userPresetGrades = new Map();
      organizedPresetGrades.set(presetGrade.studentNumber, userPresetGrades);
    }

    const formulaNode: FormulaNode | undefined =
      formulaNodesByAttainmentId.get(presetGrade.attainmentId);

    if (!formulaNode) {
      throw new ApiError(
        `found undefined formula node for attainment with ID ${presetGrade.attainmentId}`,
        HttpCode.InternalServerError
      );
    }

    userPresetGrades.set(formulaNode, presetGrade.grade);
  }

  /*
   * Finally we're ready to calculate the grades of each student starting from
   * the root attainment.
   */

  const finalGradesByStudentNumber: Map<string, GradingResult> = new Map();
  for (const [studentNumber, presetGrades] of organizedPresetGrades) {
    finalGradesByStudentNumber.set(
      studentNumber,
      await calculateFormulaNode(rootFormulaNode, presetGrades)
    );
  }

  /*
   * The grades have been calculated. Now we just need to collect them in
   * an array and return it.
   *
   * TODO: Don't return final grades, save grades to database in
   * calculateFormulaNode instead?
   */

  const finalGrades: Array<{
    studentNumber: string,
    grade: number,
    status: Status
  }> = [];

  for (const [studentNumber, finalGrade] of finalGradesByStudentNumber) {
    finalGrades.push(
      {
        studentNumber: studentNumber,
        grade: finalGrade.grade,
        status: finalGrade.status
      }
    );
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      grades: finalGrades
    }
  });
}
