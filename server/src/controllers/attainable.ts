// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import Attainable from '../database/models/attainable';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';

import { AttainableData } from '../types/course';
import { ApiError } from '../types/error';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { findAttainableById, generateAttainableTag } from './utils/attainable';
import { findCourseById } from './utils/course';
import { findCourseInstanceById } from './utils/courseInstance';

const requestSchema: yup.AnyObjectSchema = yup.object().shape({
  parentId: yup
    .number()
    .notRequired(),
  name: yup
    .string()
    .required(),
  executionDate: yup
    .date()
    .required(),
  expiryDate: yup
    .date()
    .required(),
  subAssignments: yup
    .array()
    .of(yup.lazy(() => requestSchema.default(undefined)) as never)
    .notRequired()
});

export async function addAttainable(req: Request, res: Response): Promise<void> {
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
      `instance ID ${courseInstanceId} does not belong to the course ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  const parentId: number = req.body.parentId;
  const name: string = req.body.name;
  const executionDate: Date = req.body.executionDate;
  const expiryDate: Date = req.body.expiryDate;
  const subAssignments: Array<AttainableData> = req.body.subAssignments;

  // If linked to a parent id, check that it exists and belongs to the same course instance.
  if (parentId) {
    const parentAttainable: Attainable = await findAttainableById(parentId, HttpCode.NotFound);

    if (parentAttainable.courseInstanceId !== courseInstanceId) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong to the instance ID ${courseInstanceId}`,
        HttpCode.Conflict
      );
    }
  }

  const attainable: Attainable = await models.Attainable.create({
    courseId: courseId,
    attainableId: parentId,
    courseInstanceId: courseInstanceId,
    name: name,
    executionDate: executionDate,
    expiryDate: expiryDate
  });

  if (subAssignments.length === 0) {
    res.status(HttpCode.Ok).json({
      success: true,
      data: {
        attainment: {
          courseId: attainable.courseId,
          courseInstanceId: attainable.courseInstanceId,
          name: attainable.name,
          executionDate: attainable.executionDate,
          expiryDate: attainable.expiryDate,
          parentId: attainable.attainableId,
          tag: generateAttainableTag(
            attainable.id, attainable.courseId, attainable.courseInstanceId
          )
        }
      }
    });
    return;
  }

  async function processSubAttainables(
    unprocessedAttainables: Array<AttainableData>, parentId: number
  ): Promise<Array<AttainableData>> {
    const attainables: Array<AttainableData> = [];
    let subAttainables: Array<AttainableData> = [];

    for (const attainable of unprocessedAttainables) {
      const dbEntry: Attainable = await models.Attainable.create({
        attainableId: parentId,
        courseId: courseId,
        courseInstanceId: courseInstanceId,
        name: attainable.name,
        executionDate: attainable.executionDate,
        expiryDate: attainable.expiryDate
      });

      if (attainable.subAssignments.length > 0) {
        subAttainables = await processSubAttainables(attainable.subAssignments, dbEntry.id);
      }

      attainables.push({
        id: dbEntry.id,
        courseId: dbEntry.courseId,
        courseInstanceId: dbEntry.courseInstanceId,
        name: dbEntry.name,
        executionDate: dbEntry.executionDate,
        expiryDate: dbEntry.expiryDate,
        parentId: dbEntry.attainableId,
        tag: generateAttainableTag(
          dbEntry.id, dbEntry.courseId, dbEntry.courseInstanceId
        ),
        subAssignments: subAttainables
      });
    }
    return attainables;
  }

  const subAttainables: Array<AttainableData> = await processSubAttainables(
    subAssignments, attainable.id
  );

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: {
        id: attainable.id,
        courseId: attainable.courseId,
        courseInstanceId: attainable.courseInstanceId,
        name: attainable.name,
        executionDate: attainable.executionDate,
        expiryDate: attainable.expiryDate,
        parentId: attainable.attainableId,
        tag: generateAttainableTag(
          attainable.id, attainable.courseId, attainable.courseInstanceId
        ),
        subAssignments: subAttainables
      }
    }
  });
}

export async function updateAttainable(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  const attainableId: number = Number(req.params.attainmentId);

  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });
  await idSchema.validate({ id: attainableId }, { abortEarly: false });
  await requestSchema.validate(req.body, { abortEarly: false });

  const name: string = req.body.name;
  const executionDate: Date = req.body.executionDate;
  const expiryDate: Date = req.body.expiryDate;
  const parentId: number = req.body.parentId;

  const attainable: Attainable = await findAttainableById(attainableId, HttpCode.NotFound);

  // If linked to a parent id, check that it exists and belongs
  // to the same course instance as the attainable being edited.
  if (parentId) {
    const parentAttainable: Attainable = await findAttainableById(parentId, HttpCode.NotFound);

    if (parentAttainable.courseInstanceId !== attainable.courseInstanceId) {
      throw new ApiError(
        `parent attainment ID ${parentId} does not belong to 
        the same instance as attainment ID ${attainableId}`,
        HttpCode.Conflict
      );
    }
  }

  await attainable.set({
    name: name ?? attainable.name,
    executionDate: executionDate ?? attainable.executionDate,
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
        executionDate: attainable.executionDate,
        expiryDate: attainable.expiryDate,
        parentId: attainable.attainableId,
        tag: generateAttainableTag(
          attainable.id, attainable.courseId, attainable.courseInstanceId
        ),
      }
    }
  });
}
