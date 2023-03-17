// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import Attainable from '../database/models/attainable';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import UserAttainmentGrade from '../database/models/userAttainmentGrade';

import { AttainableData, AttainableRequestData, Formula, FormulaParams } from '../types/attainable';
import { ApiError } from '../types/error';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { findAttainableById, generateAttainableTag } from './utils/attainable';
import { findCourseById } from './utils/course';
import { findCourseInstanceById } from './utils/courseInstance';

export async function addAttainable(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    parentId: yup
      .number()
      .notRequired(),
    name: yup
      .string()
      .required(),
    date: yup
      .date()
      .required(),
    expiryDate: yup
      .date()
      .required(),
    subAttainments: yup
      .array()
      .of(yup.lazy(() => requestSchema.default(undefined)) as never)
      .notRequired()
  });

  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });
  await requestSchema.validate(req.body, { abortEarly: false });

  const course: Course = await findCourseById(courseId, HttpCode.NotFound);

  const instance: CourseInstance = await findCourseInstanceById(
    courseInstanceId, HttpCode.NotFound
  );

  // Check that instance belongs to the course.
  if (instance.courseId !== course.id) {
    throw new ApiError(
      `course instance with ID ${courseInstanceId} ` +
      `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  const parentId: number | undefined = req.body.parentId;
  const name: string = req.body.name;
  const date: Date = req.body.date;
  const expiryDate: Date = req.body.expiryDate;
  const requestSubAttainables: Array<AttainableRequestData> | undefined = req.body.subAttainments;
  let subAttainables: Array<AttainableData> = [];

  // If linked to a parent id, check that it exists and belongs to the same course instance.
  if (parentId) {
    const parentAttainable: Attainable = await findAttainableById(
      parentId, HttpCode.UnprocessableEntity
    );

    if (parentAttainable.courseInstanceId !== courseInstanceId) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong ` +
        `to the course instance ID ${courseInstanceId}`,
        HttpCode.Conflict
      );
    }
  }

  const attainable: Attainable = await models.Attainable.create({
    courseId: courseId,
    attainableId: parentId,
    courseInstanceId: courseInstanceId,
    name: name,
    date: date,
    expiryDate: expiryDate,
    formulaId: Formula.Manual,
  });

  async function processSubAttainables(
    unprocessedAttainables: Array<AttainableRequestData>, parentId: number
  ): Promise<Array<AttainableData>> {
    const attainables: Array<AttainableData> = [];
    let subAttainables: Array<AttainableData> = [];

    for (const attainable of unprocessedAttainables) {
      const dbEntry: Attainable = await models.Attainable.create({
        attainableId: parentId,
        courseId: courseId,
        courseInstanceId: courseInstanceId,
        name: attainable.name,
        date: attainable.date,
        expiryDate: attainable.expiryDate,
        formulaId: Formula.Manual,
      });

      if (attainable.subAttainments.length > 0) {
        subAttainables = await processSubAttainables(attainable.subAttainments, dbEntry.id);
      }

      attainables.push({
        id: dbEntry.id,
        courseId: dbEntry.courseId,
        courseInstanceId: dbEntry.courseInstanceId,
        name: dbEntry.name,
        date: dbEntry.date,
        expiryDate: dbEntry.expiryDate,
        parentId: dbEntry.attainableId,
        tag: generateAttainableTag(
          dbEntry.id, dbEntry.courseId, dbEntry.courseInstanceId
        ),
        subAttainments: subAttainables
      });
    }
    return attainables;
  }

  if (requestSubAttainables) {
    subAttainables = await processSubAttainables(requestSubAttainables, attainable.id);
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: {
        id: attainable.id,
        courseId: attainable.courseId,
        courseInstanceId: attainable.courseInstanceId,
        name: attainable.name,
        date: attainable.date,
        expiryDate: attainable.expiryDate,
        parentId: attainable.attainableId,
        tag: generateAttainableTag(
          attainable.id, attainable.courseId, attainable.courseInstanceId
        ),
        subAttainments: subAttainables
      }
    }
  });
}

export async function updateAttainable(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    parentId: yup
      .number()
      .notRequired(),
    name: yup
      .string()
      .notRequired(),
    date: yup
      .date()
      .notRequired(),
    expiryDate: yup
      .date()
      .notRequired()
  });

  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  const attainableId: number = Number(req.params.attainmentId);

  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });
  await idSchema.validate({ id: attainableId }, { abortEarly: false });
  await requestSchema.validate(req.body, { abortEarly: false });

  const name: string | undefined = req.body.name;
  const date: Date | undefined = req.body.date;
  const expiryDate: Date | undefined = req.body.expiryDate;
  const parentId: number| undefined = req.body.parentId;

  const attainable: Attainable = await findAttainableById(attainableId, HttpCode.NotFound);

  // If linked to a parent id, check that it exists and belongs
  // to the same course instance as the attainable being edited.
  if (parentId) {

    if (parentId === attainable.id) {
      throw new ApiError(
        'attainment cannot refer to itself in the parent ID',
        HttpCode.Conflict
      );
    }

    const parentAttainable: Attainable = await findAttainableById(
      parentId,
      HttpCode.UnprocessableEntity
    );

    if (parentAttainable.courseInstanceId !== attainable.courseInstanceId) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong to ` +
        `the same instance as attainment ID ${attainableId}`,
        HttpCode.Conflict
      );
    }
  }

  await attainable.set({
    name: name ?? attainable.name,
    date: date ?? attainable.date,
    expiryDate: expiryDate ?? attainable.expiryDate,
    attainableId: parentId ?? attainable.attainableId
  }).save();

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: {
        id: attainable.id,
        courseId: attainable.courseId,
        courseInstanceId: attainable.courseInstanceId,
        name: attainable.name,
        date: attainable.date,
        expiryDate: attainable.expiryDate,
        parentId: attainable.attainableId,
        tag: generateAttainableTag(
          attainable.id, attainable.courseId, attainable.courseInstanceId
        )
      }
    }
  });
}

enum Status {
  Pass = 'pass',
  Fail = 'fail',
}

type CalculationResult = {
  status: Status;
  points: number | undefined;
}

type WeightedAssignmentParams = {
  min: number;
  max: number;
  weights: Array<number>;
}

type FormulaFunction = (subResults: Array<CalculationResult>) => Promise<CalculationResult>;
type ParameterizedFormulaFunction = (parameters: any, subResults: Array<CalculationResult>) => Promise<CalculationResult>;
type FormulaNode = {
  validatedFormula: FormulaFunction;
  subFormulaNodes: Array<FormulaNode>;
};

const formulasWithSchema: Map<Formula, [yup.AnyObjectSchema, ParameterizedFormulaFunction]> = new Map();
formulasWithSchema.set(
  Formula.Manual,
  [
    yup.object(),
    async (_subGrades, _params) => { return { status: Status.Fail, points: undefined }; },
  ]
);

async function calculatedWeightedAverage(
  params: WeightedAssignmentParams,
  subResults: Array<CalculationResult>
): Promise<CalculationResult> {
  const weighted: CalculationResult =
    params.weights
      .reduce(
        (
          acc: CalculationResult,
          weight: number,
          i: number,
        ) => {
          if (acc.status == Status.Fail || subResults[i].status == Status.Fail) {
            return { points: undefined, status: Status.Fail };
          }
          return {
            points: (acc.points ?? 0) + weight * (subResults[i].points ?? 0),
            status: Status.Pass,
          };
        },
        { status: Status.Pass, points: 0 }
      );

  return weighted;
}

formulasWithSchema.set(
  Formula.WeightedAverage,
  [
    yup.object({
      min: yup.number().required(),
      max: yup.number().required(),
      weights: yup.array(yup.number().required()).required(),
    }),
    calculatedWeightedAverage,
  ]
);

const formulaChecker = yup.string().oneOf([Formula.Manual, Formula.WeightedAverage]).required();

async function validate<P extends FormulaParams>(
  fn: (params: P, subPoints: Array<CalculationResult>) => Promise<CalculationResult>,
  schema: yup.AnyObjectSchema,
  params: unknown,
): Promise<FormulaFunction> {
  await schema.validate(params);
  return (subGrades) => fn(params as P, subGrades);
}

function getFormula(name: Formula, params: FormulaParams) {
  const formulaWithSchema = formulasWithSchema.get(name)!;
  return validate(formulaWithSchema[1], formulaWithSchema[0], params);
}

async function calculate(tree: FormulaNode, presetPoints: Map<FormulaNode, number>): Promise<CalculationResult> {
  if (presetPoints.has(tree)) {
    return { status: Status.Pass, points: presetPoints.get(tree) };
  }
  // Not calculated so far, so calculate the points for lower nodes.
  const subPoints = await Promise.all(tree.subFormulaNodes.map((subTree) => calculate(subTree, presetPoints)));
  // Based on the results from lower nodes, calculate the points for this node.
  return await tree.validatedFormula(subPoints);
}

export async function calculateGrades(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });

  let formulaNodesById: Map<number, FormulaNode> = new Map();

  let attainables: Array<{
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

  let rootAttainable = null;
  for (const attainable of attainables) {
    const formulaId = attainable.formulaId;
    const params = attainable.formulaParams;
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
        throw new ApiError('duplicate root attainment', HttpCode.InternalServerError); // the database is in a conflicting state
      }
      rootAttainable = formulaNodesById.get(attainable.id)!;
    } else {
      formulaNodesById.get(attainable.attainableId)!.subFormulaNodes.push(formulaNodesById.get(attainable.id)!);
    }
  }

  if (!rootAttainable) {
    throw new ApiError('no root attainment for this course instance; maybe there is a cycle', HttpCode.BadRequest);
  }

  let studentPoints: Array<{
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

  let presetPointsByStudentId: Map<number, Map<FormulaNode, number>> = new Map(); // student id -> formula node -> preset points
  for (const student of studentPoints) {
    if (!presetPointsByStudentId.has(student.userId)) {
      presetPointsByStudentId.set(student.userId, new Map());
    }
    presetPointsByStudentId.get(student.userId)!.set(formulaNodesById.get(student.attainableId)!, student.points);
  }

  let rootAttainablePointsByStudent: Map<number, CalculationResult> = new Map();
  for (const [studentId, presetPoints] of presetPointsByStudentId) {
    rootAttainablePointsByStudent.set(studentId, await calculate(rootAttainable, presetPoints));
  }

  res.status(HttpCode.Ok)
    .json({
      success: true,
      data: {
        grades: Array.from(rootAttainablePointsByStudent).map(([studentId, result]) => {
          return {
            studentId,
            grade: result.points,
            status: result.status,
          };
        })
      }
    });
}
