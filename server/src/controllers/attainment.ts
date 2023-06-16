// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import AssessmentModel from '../database/models/assessmentModel';
import Attainment from '../database/models/attainment';
import Course from '../database/models/course';

import { AttainmentData, AttainmentRequestData } from '../types/attainment';
import { ApiError } from '../types/error';
import { Formula } from '../types/formulas';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';

import { findAttainmentById, generateAttainmentTree } from './utils/attainment';
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
    subAttainments: yup
      .array()
      .of(yup.lazy(() => requestSchema.default(undefined)) as never)
      .notRequired()
  });

  await requestSchema.validate(req.body, { abortEarly: false });
  const [course, assessmentModel]: [course: Course, assessmentModel: AssessmentModel] =
    await validateCourseAndAssessmentModel(
      req.params.courseId, req.params.assessmentModelId
    );

  const parentId: number | undefined = req.body.parentId;
  const name: string = req.body.name;
  const tag: string = req.body.tag;
  const daysValid: number = req.body.daysValid;
  const requestSubAttainments: Array<AttainmentRequestData> | undefined = req.body.subAttainments;
  let subAttainments: Array<AttainmentData> = [];

  // If linked to a parent id, check that it exists and belongs to the same course instance.
  if (parentId) {
    const parentAttainment: Attainment = await findAttainmentById(
      parentId, HttpCode.UnprocessableEntity
    );

    if (parentAttainment.assessmentModelId !== assessmentModel.id) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong ` +
        `to the assessment model ID ${assessmentModel.id}`,
        HttpCode.Conflict
      );
    }
  }

  const attainment: Attainment = await models.Attainment.create({
    assessmentModelId: assessmentModel.id,
    parentId,
    name,
    tag,
    daysValid,
    formula: Formula.Manual
  });

  async function processSubAttainments(
    unprocessedAttainments: Array<AttainmentRequestData>, parentId: number
  ): Promise<Array<AttainmentData>> {
    const attainments: Array<AttainmentData> = [];
    let subAttainments: Array<AttainmentData> = [];

    for (const attainment of unprocessedAttainments) {
      const dbEntry: Attainment = await models.Attainment.create({
        parentId,
        assessmentModelId: assessmentModel.id,
        name: attainment.name,
        tag: attainment.tag,
        daysValid: attainment.daysValid,
        formula: Formula.Manual
      });

      if (attainment.subAttainments.length > 0) {
        subAttainments = await processSubAttainments(attainment.subAttainments, dbEntry.id);
      }

      attainments.push({
        id: dbEntry.id,
        assessmentModelId: dbEntry.id,
        name: dbEntry.name,
        tag: dbEntry.tag,
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

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: {
        id: attainment.id,
        courseId: attainment.courseId,
        name: attainment.name,
        tag: attainment.tag,
        parentId: attainment.parentId,
        subAttainments: subAttainments
      }
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
      .required()
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
  const parentId: number| undefined = req.body.parentId;

  const attainment: Attainment = await findAttainmentById(attainmentId, HttpCode.NotFound);

  // If linked to a parent id, check that it exists and belongs
  // to the same course instance as the attainment being edited.
  if (parentId) {

    // TODO: check that does not refer to itself transitionally through some other attainment.
    if (parentId === attainment.id) {
      throw new ApiError(
        'attainment cannot refer to itself in the parent ID',
        HttpCode.Conflict
      );
    }

    const parentAttainment: Attainment = await findAttainmentById(
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
  }

  await attainment.set({
    name: name ?? attainment.name,
    tag: tag ?? attainment.tag,
    daysValid: daysValid ?? attainment.daysValid,
    parentId: parentId ?? attainment.parentId
  }).save();

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: {
        id: attainment.id,
        assessmentModelId: attainment.assessmentModelId,
        name: attainment.name,
        tag: attainment.tag,
        daysValid: attainment.daysValid,
        parentId: attainment.parentId
      }
    }
  });
}

export async function getAttainment(req: Request, res: Response): Promise<void> {
  const querySchema: yup.AnyObjectSchema = yup.object().shape({
    tree: yup.string().oneOf(['children', 'descendants'])
  }).noUnknown(true).strict();

  await querySchema.validate(req.query, { abortEarly: false });
  await idSchema.validate({ id: req.params.attainmentId }, { abortEarly: false });
  const attainmentId: number = Number(req.params.attainmentId);
  const [course, assessmentModel]: [course: Course, assessmentModel: AssessmentModel] =
    await validateCourseAndAssessmentModel(
      req.params.courseId, req.params.assessmentModelId
    );

  // Assert string type, as the query is validated above
  const tree: string = req.query.tree as string;

  const attainments: Array<Attainment> = await Attainment.findAll({
    where: {
      assessmentModelId: assessmentModel.id,
    }
  });

  const attainmentData: Array<AttainmentData> = attainments.map(
    (attainment: Attainment) => {
      return {
        id: attainment.id,
        assessmentModelId: attainment.assessmentModelId,
        parentId: attainment.parentId ?? undefined,
        name: attainment.name,
        tag: attainment.tag,
        daysValid: attainment.daysValid
      };
    }
  );

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
    data: localRoot,
  });
}
