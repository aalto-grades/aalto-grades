// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';

import Attainable from '../database/models/attainable';
import UserAttainmentGrade from '../database/models/userAttainmentGrade';

import { ApiError } from '../types/error';
import {
  CalculationResult,
  Formula,
  formulaChecker,
  FormulaNode,
  FormulaParams,
  getFormula,
  Status
} from '../types/formulas';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';

async function calculate(
  tree: FormulaNode,
  presetPoints: Map<FormulaNode, number>
): Promise<CalculationResult> {
  if (presetPoints.has(tree)) {
    return { status: Status.Pass, points: presetPoints.get(tree) };
  }
  // Not calculated so far, so calculate the points for lower nodes.
  const subPoints: Array<CalculationResult> =
    await Promise.all(
      tree.subFormulaNodes.map(
        (subTree: FormulaNode) => calculate(subTree, presetPoints)
      )
    );
  // Based on the results from lower nodes, calculate the points for this node.
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

  const formulaNodesById: Map<number, FormulaNode> = new Map();

  const attainables: Array<{
    id: number,
    attainableId: number,
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
    ]
  });

  let rootAttainable: null | FormulaNode = null;
  for (const attainable of attainables) {
    const formulaId: Formula | null = attainable.formulaId;
    const params: FormulaParams | null = attainable.formulaParams;
    if (!(await formulaChecker.validate(formulaId))) {
      throw new Error('bad');
    }
    if (params === null) {
      throw new ApiError('the parameters for a formula haven\'t been set', HttpCode.BadRequest);
    }

    formulaNodesById.set(attainable.id, {
      validatedFormula: await getFormula(formulaId as Formula, params),
      subFormulaNodes: [],
    });
  }

  for (const attainable of attainables) {
    if (attainable.attainableId === null) { // parent id
      if (rootAttainable) {
        // the database is in a conflicting state
        throw new ApiError(
          'duplicate root attainment',
          HttpCode.InternalServerError
        );
      }
      rootAttainable = formulaNodesById.get(attainable.id)!;
    } else {
      formulaNodesById
        .get(attainable.attainableId)!
        .subFormulaNodes
        .push(formulaNodesById.get(attainable.id)!);
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
      .set(formulaNodesById.get(student.attainableId)!, student.points);
  }

  const rootAttainablePointsByStudent: Map<number, CalculationResult> = new Map();
  for (const [studentId, presetPoints] of presetPointsByStudentId) {
    rootAttainablePointsByStudent.set(
      studentId,
      await calculate(rootAttainable, presetPoints)
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
