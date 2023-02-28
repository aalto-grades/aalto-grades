// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import Attainable from '../database/models/attainable';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';

import { ApiError } from '../types/error';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { findAttainableById } from './utils/attainable';
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
    .required()
});

export async function addAttainable(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  const courseInstanceId: number = Number(req.params.instanceId);
  await idSchema.validate({ id: courseId }, { abortEarly: false });
  await idSchema.validate({ id: courseInstanceId }, { abortEarly: false });
  await requestSchema.validate(req.body, { abortEarly: false });

  const parentId: number | undefined = req.body.parentId;
  const name: string = req.body.name;
  const executionDate: Date = req.body.executionDate;
  const expiryDate: Date = req.body.expiryDate;

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

  // If linked to a parent id, check that it exists and belongs to the same instance.
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
    courseInstanceId: courseInstanceId,
    attainableId: parentId,
    name: name,
    executionDate: executionDate,
    expiryDate: expiryDate
  });

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: {
        id: attainable.id
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

  const attainable: Attainable = await findAttainableById(attainableId, HttpCode.NotFound);

  await attainable.set({
    name: name ?? attainable.name,
    executionDate: executionDate ?? attainable.executionDate,
    expiryDate: expiryDate ?? attainable.expiryDate
  }).save();

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      attainment: attainable
    }
  });
}
