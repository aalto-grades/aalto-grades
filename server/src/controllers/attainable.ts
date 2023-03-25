// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import Attainable from '../database/models/attainable';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';

import { AttainableData, AttainableRequestData } from '../types/attainable';
import { ApiError } from '../types/error';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { findAttainableById, generateAttainableTag } from './utils/attainable';
import { findCourseById } from './utils/course';
import { findCourseInstanceById } from './utils/courseInstance';

async function validateCourseAndInstance(
  courseId: number, courseInstanceId: number
): Promise<void> {
  // Ensure that course exists.
  const course: Course = await findCourseById(courseId, HttpCode.NotFound);

  // Ensure that course instance exists.
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
}

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

  // Get path parameters.
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);

  // Validation.
  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });
  await requestSchema.validate(req.body, { abortEarly: false });
  await validateCourseAndInstance(courseId, courseInstanceId);

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
    expiryDate: expiryDate
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
        expiryDate: attainable.expiryDate
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

export async function deleteAttainment(req: Request, res: Response): Promise<void> {
  /*
   * TODO: Check that the requester is logged in, 401 Unauthorized if not
   * TODO: Check that the requester is authorized to delete attainments, 403
   * Forbidden if not
   */

  // Get path parameters.
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  const attainmentId: number = Number(req.params.attainmentId);

  // Validation.
  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });
  await idSchema.validate({ id: attainmentId }, { abortEarly: false });
  await validateCourseAndInstance(courseId, courseInstanceId);

  // Find the attainment to be deleted.
  const attainment: Attainable = await findAttainableById(attainmentId, HttpCode.NotFound);

  // Delete the attainment, this automatically also deletes all of the
  // subattainments of this attainment.
  await attainment.destroy();

  res.status(HttpCode.Ok).send({
    success: true,
    data: {}
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
  await validateCourseAndInstance(courseId, courseInstanceId);

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
