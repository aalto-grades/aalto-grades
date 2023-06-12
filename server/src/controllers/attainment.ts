// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import Attainment from '../database/models/attainment';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';

import { AttainmentData, AttainmentRequestData, treeSchema } from '../types/attainment';
import { ApiError } from '../types/error';
import { Formula } from '../types/formulas';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';

import {
  findAllAttainmentsForInstance,
  findAttainmentById,
  generateAttainmentTag,
  generateAttainmentTree
} from './utils/attainment';
import { validateCourseAndInstance } from './utils/courseInstance';

export async function addAttainment(req: Request, res: Response): Promise<void> {
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

  await requestSchema.validate(req.body, { abortEarly: false });
  const [course, courseInstance]: [course: Course, courseInstance: CourseInstance] =
  await validateCourseAndInstance(req.params.courseId, req.params.instanceId);

  const parentId: number | undefined = req.body.parentId;
  const name: string = req.body.name;
  const date: Date = req.body.date;
  const expiryDate: Date = req.body.expiryDate;
  const requestSubAttainments: Array<AttainmentRequestData> | undefined = req.body.subAttainments;
  let subAttainments: Array<AttainmentData> = [];

  // If linked to a parent id, check that it exists and belongs to the same course instance.
  if (parentId) {
    const parentAttainment: Attainment = await findAttainmentById(
      parentId, HttpCode.UnprocessableEntity
    );

    if (parentAttainment.courseInstanceId !== courseInstance.id) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong ` +
        `to the course instance ID ${courseInstance.id}`,
        HttpCode.Conflict
      );
    }
  }

  const attainment: Attainment = await models.Attainment.create({
    courseId: course.id,
    attainmentId: parentId,
    courseInstanceId: courseInstance.id,
    name,
    date,
    expiryDate,
    formula: Formula.Manual,
  });

  async function processSubAttainments(
    unprocessedAttainments: Array<AttainmentRequestData>, parentId: number
  ): Promise<Array<AttainmentData>> {
    const attainments: Array<AttainmentData> = [];
    let subAttainments: Array<AttainmentData> = [];

    for (const attainment of unprocessedAttainments) {
      const dbEntry: Attainment = await models.Attainment.create({
        attainmentId: parentId,
        courseId: course.id,
        courseInstanceId: courseInstance.id,
        name: attainment.name,
        date: attainment.date,
        expiryDate: attainment.expiryDate,
        formula: Formula.Manual
      });

      if (attainment.subAttainments.length > 0) {
        subAttainments = await processSubAttainments(attainment.subAttainments, dbEntry.id);
      }

      attainments.push({
        id: dbEntry.id,
        courseId: dbEntry.courseId,
        courseInstanceId: dbEntry.courseInstanceId,
        name: dbEntry.name,
        date: dbEntry.date,
        expiryDate: dbEntry.expiryDate,
        parentId: dbEntry.attainmentId,
        tag: generateAttainmentTag(
          dbEntry.id, dbEntry.courseId, dbEntry.courseInstanceId
        ),
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
        courseInstanceId: attainment.courseInstanceId,
        name: attainment.name,
        date: attainment.date,
        expiryDate: attainment.expiryDate,
        parentId: attainment.attainmentId,
        tag: generateAttainmentTag(
          attainment.id, attainment.courseId, attainment.courseInstanceId
        ),
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
  await validateCourseAndInstance(req.params.courseId, req.params.instanceId);

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
    date: yup
      .date()
      .notRequired(),
    expiryDate: yup
      .date()
      .notRequired()
  });

  const attainmentId: number = Number(req.params.attainmentId);
  await idSchema.validate({ id: attainmentId }, { abortEarly: false });
  await requestSchema.validate(req.body, { abortEarly: false });
  await validateCourseAndInstance(req.params.courseId, req.params.instanceId);

  const name: string | undefined = req.body.name;
  const date: Date | undefined = req.body.date;
  const expiryDate: Date | undefined = req.body.expiryDate;
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

    if (parentAttainment.courseInstanceId !== attainment.courseInstanceId) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong to ` +
        `the same instance as attainment ID ${attainmentId}`,
        HttpCode.Conflict
      );
    }
  }

  await attainment.set({
    name: name ?? attainment.name,
    date: date ?? attainment.date,
    expiryDate: expiryDate ?? attainment.expiryDate,
    attainmentId: parentId ?? attainment.attainmentId
  }).save();

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: {
        id: attainment.id,
        courseId: attainment.courseId,
        courseInstanceId: attainment.courseInstanceId,
        name: attainment.name,
        date: attainment.date,
        expiryDate: attainment.expiryDate,
        parentId: attainment.attainmentId,
        tag: generateAttainmentTag(
          attainment.id, attainment.courseId, attainment.courseInstanceId
        )
      }
    }
  });
}

export async function getAttainment(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  const instanceId: number = Number(req.params.instanceId);
  const attainmentId: number = Number(req.params.attainmentId);

  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: instanceId }, { abortEarly: false });
  await idSchema.validate({ id: attainmentId }, { abortEarly: false });
  await treeSchema.validate(req.query, { abortEarly: false });

  // Assert string type, as the query is validated above
  const tree: string | undefined = <string | undefined>req.query.tree;

  const attainmentData: Array<AttainmentData> = await findAllAttainmentsForInstance(
    courseId,
    instanceId
  );

  const attainment: AttainmentData | undefined = attainmentData.find(
    (el: AttainmentData) => el.id === attainmentId);

  if (!attainment) {
    throw new ApiError(`Attainment with id ${attainmentId} was not found ` +
      'for the specified course and instance', HttpCode.NotFound);
  }

  switch (tree) {

  case 'children':
    generateAttainmentTree(attainment, attainmentData, true);
    break;

  case 'descendants':
    generateAttainmentTree(attainment, attainmentData);
    break;

  default:
    break;

  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: attainment,
  });
}

export async function getAllAttainments(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  const instanceId: number = Number(req.params.instanceId);

  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: instanceId }, { abortEarly: false });
  await treeSchema.validate(req.query, { abortEarly: false });

  // Assert string type, as the query is validated above
  const tree: string | undefined = <string | undefined>req.query.tree;

  const allAttainmentData: Array<AttainmentData> = await findAllAttainmentsForInstance(
    courseId,
    instanceId
  );

  const rootAttainments: Array<AttainmentData> = allAttainmentData.filter(
    (el: AttainmentData) => !el.parentId
  );

  if (tree) {
    const onlyChildren: boolean = tree === 'children' ? true : false;
    rootAttainments.forEach((el: AttainmentData) => {
      generateAttainmentTree(el, allAttainmentData, onlyChildren);
    });
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: rootAttainments,
  });

}
