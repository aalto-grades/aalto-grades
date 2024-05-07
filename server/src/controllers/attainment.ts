// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AttainmentData,
  EditAttainmentDataSchema,
  HttpCode,
  NewAttainmentDataSchema,
} from '@common/types';
import Attainment from '../database/models/attainment';
import {
  findAttainmentsByCourseId,
  validateAttainmentPath,
} from './utils/attainment';
import {findAndValidateCourseId, validateCourseId} from './utils/course';

/**
 * Responds with AttainmentData[]
 *
 * @throws ApiError(400|404)
 */
export const getAttainments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);
  const attainmentData: AttainmentData[] = await findAttainmentsByCourseId(
    course.id
  );

  res.json(attainmentData);
};

/**
 * Responds with number
 *
 * @throws ApiError(400|404)
 */
export const addAttainment = async (
  req: TypedRequestBody<typeof NewAttainmentDataSchema>,
  res: Response
): Promise<void> => {
  const courseId = await validateCourseId(req.params.courseId);

  const newAttainment = await Attainment.create({
    courseId: courseId,
    name: req.body.name,
    daysValid: req.body.daysValid,
  });

  res.status(HttpCode.Created).json(newAttainment.id);
};

/** @throws ApiError(400|404|409) */
export const editAttainment = async (
  req: TypedRequestBody<typeof EditAttainmentDataSchema>,
  res: Response
): Promise<void> => {
  const [_, attainment] = await validateAttainmentPath(
    req.params.courseId,
    req.params.attainmentId
  );

  await attainment
    .set({
      name: req.body.name ?? attainment.name,
      daysValid: req.body.daysValid ?? attainment.daysValid,
      archived: req.body.archived ?? attainment.archived,
    })
    .save();

  res.sendStatus(HttpCode.Ok);
};

/** @throws ApiError(400|404|409) */
export const deleteAttainment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [_, attainment] = await validateAttainmentPath(
    req.params.courseId,
    req.params.attainmentId
  );

  await attainment.destroy();

  res.sendStatus(HttpCode.Ok);
};
