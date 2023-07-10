// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import AssessmentModel from '../database/models/assessmentModel';
import Attainment from '../database/models/attainment';
import Course from '../database/models/course';

import { AttainmentData, Formula } from 'aalto-grades-common/types';
import { getFormulaImplementation } from '../formulas';
import { ApiError } from '../types/error';
import { FormulaImplementation } from '../types/formulas';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import {
  findAttainmentById, findAttainmentsByAssessmentModel, generateAttainmentTree
} from './utils/attainment';
import { validateCourseAndAssessmentModel } from './utils/assessmentModel';

export async function addAttainment(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    parentId: yup
      .number()
      .notRequired(),
    name: yup
      .string()
      .required(),
    tag: yup
      .string()
      .required(),
    daysValid: yup
      .number()
      .min(0)
      .required(),
    formula: yup
      .string()
      .oneOf(Object.values(Formula))
      .notRequired(),
    formulaParams: yup // More thorough validation is done later
      .object()
      .nullable()
      .notRequired(),
    subAttainments: yup
      .array()
      .of(yup.lazy(() => requestSchema.default(undefined)) as never)
      .notRequired()
  });

  await requestSchema.validate(req.body, { abortEarly: false });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateCourseAndAssessmentModel(
      req.params.courseId, req.params.assessmentModelId
    );

  const parentId: number | undefined = req.body.parentId;
  const name: string = req.body.name;
  const tag: string = req.body.tag;
  const daysValid: number = req.body.daysValid;
  const formula: Formula | undefined = req.body.formula;
  const formulaParams: object | undefined = req.body.formulaParams;
  const requestSubAttainments: Array<AttainmentData> | undefined = req.body.subAttainments;
  let subAttainments: Array<AttainmentData> = [];

  // If linked to a parent ID...
  if (parentId) {
    // 1. Ensure that it exists
    const parentAttainment: Attainment = await findAttainmentById(
      parentId, HttpCode.UnprocessableEntity
    );

    // 2. Ensure that it belongs to the same assessment model
    if (parentAttainment.assessmentModelId !== assessmentModel.id) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong ` +
        `to the assessment model ID ${assessmentModel.id}`,
        HttpCode.Conflict
      );
    }

    // 3. Ensure that the given parent formula params match the formula of the
    // parent attainment
    const parentFormula: FormulaImplementation =
      getFormulaImplementation(parentAttainment.formula);
    await parentFormula.paramSchema.validate(formulaParams);
  }

  async function validateFormulaParams(
    attainments: Array<AttainmentData>,
    parentFormula: FormulaImplementation
  ): Promise<void> {
    for (const attainment of attainments) {
      await parentFormula.paramSchema.validate(attainment.formulaParams);
      if (attainment.subAttainments) {
        await validateFormulaParams(
          attainment.subAttainments,
          getFormulaImplementation(attainment.formula ?? Formula.Manual)
        );
      }
    }
  }

  if (requestSubAttainments) {
    await validateFormulaParams(
      requestSubAttainments,
      getFormulaImplementation(formula ?? Formula.Manual)
    );
  }

  const attainment: Attainment = await Attainment.create({
    assessmentModelId: assessmentModel.id,
    parentId: parentId,
    name: name,
    tag: tag,
    daysValid: daysValid,
    formula: formula ?? Formula.Manual,
    formulaParams: formulaParams
  });

  async function processSubAttainments(
    unprocessedAttainments: Array<AttainmentData>, parentId: number
  ): Promise<Array<AttainmentData>> {
    const attainments: Array<AttainmentData> = [];
    let subAttainments: Array<AttainmentData> = [];

    for (const attainment of unprocessedAttainments) {
      const dbEntry: Attainment = await Attainment.create({
        parentId,
        assessmentModelId: assessmentModel.id,
        name: attainment.name,
        tag: attainment.tag,
        daysValid: attainment.daysValid,
        formula: attainment.formula ?? Formula.Manual,
        formulaParams: attainment.formulaParams
      });

      if (attainment.subAttainments && attainment.subAttainments.length > 0) {
        subAttainments = await processSubAttainments(attainment.subAttainments, dbEntry.id);
      }

      attainments.push({
        id: dbEntry.id,
        assessmentModelId: dbEntry.id,
        name: dbEntry.name,
        tag: dbEntry.tag,
        formula: dbEntry.formula,
        formulaParams: dbEntry.formulaParams,
        daysValid: dbEntry.daysValid,
        parentId: dbEntry.parentId,
        subAttainments: subAttainments
      });
    }
    return attainments;
  }

  if (requestSubAttainments) {
    subAttainments = await processSubAttainments(requestSubAttainments, attainment.id);
  }

  const attainmentTree: AttainmentData = {
    id: attainment.id,
    assessmentModelId: attainment.assessmentModelId,
    name: attainment.name,
    tag: attainment.tag,
    formula: attainment.formula,
    formulaParams: attainment.formulaParams,
    daysValid: attainment.daysValid,
    parentId: attainment.parentId,
    subAttainments: subAttainments
  };

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: attainmentTree
    }
  });
}

export async function deleteAttainment(req: Request, res: Response): Promise<void> {
  /*
   * TODO: Check that the requester is authorized to delete attainments, 403
   * Forbidden if not
   */

  // Get path parameters.
  const attainmentId: number = Number(req.params.attainmentId);

  // Validation.
  await idSchema.validate({ id: attainmentId }, { abortEarly: false });
  await validateCourseAndAssessmentModel(
    req.params.courseId, req.params.assessmentModelId
  );

  // Delete the attainment if found from db. This automatically
  // also deletes all of the subattainments of this attainment.
  (await findAttainmentById(attainmentId, HttpCode.NotFound)).destroy();

  res.status(HttpCode.Ok).send({
    success: true,
    data: {}
  });
}

export async function updateAttainment(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    parentId: yup
      .number()
      .notRequired(),
    name: yup
      .string()
      .notRequired(),
    tag: yup
      .string()
      .notRequired(),
    daysValid: yup
      .number()
      .min(0)
      .notRequired(),
    formula: yup.string()
      .transform((value: string, originalValue: string) => {
        return originalValue ? originalValue.toUpperCase() : value;
      })
      .oneOf(Object.values(Formula))
      .notRequired(),
    formulaParams: yup // More thorough validation is done later
      .object()
      .nullable()
      .notRequired(),
  });

  const attainmentId: number = Number(req.params.attainmentId);
  await idSchema.validate({ id: attainmentId }, { abortEarly: false });
  await requestSchema.validate(req.body, { abortEarly: false });
  await validateCourseAndAssessmentModel(
    req.params.courseId, req.params.assessmentModelId
  );

  const name: string | undefined = req.body.name;
  const tag: string | undefined = req.body.tag;
  const daysValid: number | undefined = req.body.daysValid;
  const parentId: number | undefined = req.body.parentId;
  const formula: Formula | undefined = req.body.formula;
  const formulaParams: object | undefined = req.body.formulaParams;

  const attainment: Attainment = await findAttainmentById(attainmentId, HttpCode.NotFound);
  let parentAttainment: Attainment | null = null;

  // If linked to a parent id, check that it exists and belongs
  // to the same assessment model as the attainment being edited.
  if (parentId) {

    // TODO: check that does not refer to itself transitionally through some other attainment.
    if (parentId === attainment.id) {
      throw new ApiError(
        'attainment cannot refer to itself in the parent ID',
        HttpCode.Conflict
      );
    }

    parentAttainment = await findAttainmentById(
      parentId,
      HttpCode.UnprocessableEntity
    );

    if (parentAttainment.assessmentModelId !== attainment.assessmentModelId) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong to ` +
        `the same assessment model as attainment ID ${attainmentId}`,
        HttpCode.Conflict
      );
    }
  } else if (attainment.parentId) {
    parentAttainment = await findAttainmentById(
      attainment.parentId,
      HttpCode.UnprocessableEntity
    );
  }

  if (parentAttainment) {
    const parentFormula: FormulaImplementation =
      getFormulaImplementation(parentAttainment.formula);
    await parentFormula.paramSchema.validate(formulaParams);
  } else if (formulaParams) {
    throw new ApiError(
      'root attainment can\'t have parent formula params',
      HttpCode.Conflict
    );
  }

  await attainment.set({
    name: name ?? attainment.name,
    tag: tag ?? attainment.tag,
    daysValid: daysValid ?? attainment.daysValid,
    parentId: parentId ?? attainment.parentId,
    formula: formula ?? attainment.formula,
    formulaParams: formulaParams ?? attainment.formulaParams
  }).save();

  const attainmentTree: AttainmentData = {
    id: attainment.id,
    assessmentModelId: attainment.assessmentModelId,
    name: attainment.name,
    tag: attainment.tag,
    formula: attainment.formula,
    formulaParams: attainment.formulaParams,
    daysValid: attainment.daysValid,
    parentId: attainment.parentId
  };

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: attainmentTree
    }
  });
}

async function validateTreeParam(treeParam: string): Promise<string> {
  const treeSchema: yup.AnyObjectSchema = yup.object().shape({
    tree: yup.string().oneOf(['children', 'descendants'])
  }).noUnknown(true).strict();

  await treeSchema.validate({ tree: treeParam }, { abortEarly: false });
  return treeParam;
}

export async function getAttainment(req: Request, res: Response): Promise<void> {
  const tree: string = await validateTreeParam(req.query.tree as string);
  await idSchema.validate({ id: req.params.attainmentId }, { abortEarly: false });
  const attainmentId: number = Number(req.params.attainmentId);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateCourseAndAssessmentModel(
      req.params.courseId, req.params.assessmentModelId
    );

  const attainmentData: Array<AttainmentData> =
    await findAttainmentsByAssessmentModel(assessmentModel.id);

  const localRoot: AttainmentData | undefined = attainmentData.find(
    (attainment: AttainmentData) => attainment.id === attainmentId
  );

  if (!localRoot) {
    throw new ApiError(
      `attainment with ID ${attainmentId} not found`, HttpCode.NotFound
    );
  }

  switch (tree) {
  case 'children':
    generateAttainmentTree(localRoot, attainmentData, true);
    break;
  case 'descendants':
    generateAttainmentTree(localRoot, attainmentData);
    break;
  default:
    break;
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: localRoot
    },
  });
}

export async function getRootAttainment(req: Request, res: Response): Promise<void> {
  const tree: string = await validateTreeParam(req.query.tree as string);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [course, assessmentModel]: [Course, AssessmentModel] =
    await validateCourseAndAssessmentModel(req.params.courseId, req.params.assessmentModelId);

  const allAttainmentData: Array<AttainmentData> =
    await findAttainmentsByAssessmentModel(assessmentModel.id);

  const rootAttainments: Array<AttainmentData> = allAttainmentData.filter(
    (attainment: AttainmentData) => !attainment.parentId
  );

  if (rootAttainments.length === 0) {
    throw new ApiError(
      'Root attainment was not found for the specified course and assessment model.',
      HttpCode.NotFound
    );
  } else if (rootAttainments.length > 1) {
    throw new ApiError(
      'More than one attainment without parentId was found '
      + 'for the specified course and assessment model. Attainment IDs: '
      + rootAttainments.map((attainment: AttainmentData) => attainment.id).join(),
      HttpCode.Conflict
    );
  }

  switch (tree) {
  case 'children':
    generateAttainmentTree(rootAttainments[0], allAttainmentData, true);
    break;
  case 'descendants':
    generateAttainmentTree(rootAttainments[0], allAttainmentData);
    break;
  default:
    generateAttainmentTree(rootAttainments[0], allAttainmentData);
    break;
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: rootAttainments[0]
    },
  });
}
