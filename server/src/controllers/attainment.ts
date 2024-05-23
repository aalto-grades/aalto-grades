// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ForeignKeyConstraintError, UniqueConstraintError} from 'sequelize';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AttainmentData,
  EditAttainmentDataSchema,
  HttpCode,
  NewAttainmentDataSchema,
} from '@/common/types';
import {
  findAttainmentsByCourseId,
  validateAttainmentPath,
} from './utils/attainment';
import {findAndValidateCourseId, validateCourseId} from './utils/course';
import Attainment from '../database/models/attainment';
import {ApiError} from '../types';

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

  const [attainment, created] = await Attainment.findOrCreate({
    where: {
      name: req.body.name,
      courseId: courseId,
    },
    defaults: {
      name: req.body.name,
      daysValid: req.body.daysValid,
    },
  });

  if (!created) {
    throw new ApiError(
      'There cannot be two attainments with the same name',
      HttpCode.Conflict
    );
  }

  res.status(HttpCode.Created).json(attainment.id);
};

/** @throws ApiError(400|404|409) */
export const editAttainment = async (
  req: TypedRequestBody<typeof EditAttainmentDataSchema>,
  res: Response
): Promise<void> => {
  const [, attainment] = await validateAttainmentPath(
    req.params.courseId,
    req.params.attainmentId
  );

  try {
    await attainment
      .set({
        name: req.body.name ?? attainment.name,
        daysValid: req.body.daysValid ?? attainment.daysValid,
        archived: req.body.archived ?? attainment.archived,
      })
      .save();
  } catch (e) {
    // Duplicate name error
    if (e instanceof UniqueConstraintError) {
      throw new ApiError(
        'There cannot be two attainments with the same name',
        HttpCode.Conflict
      );
    }

    // Other error
    throw e;
  }

  res.sendStatus(HttpCode.Ok);
};

/** @throws ApiError(400|404|409) */
export const deleteAttainment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [, attainment] = await validateAttainmentPath(
    req.params.courseId,
    req.params.attainmentId
  );

  try {
    await attainment.destroy();
  } catch (e) {
    // Catch deletion of attainment with grades
    if (
      e instanceof ForeignKeyConstraintError &&
      e.index === 'attainment_grade_attainment_id_fkey'
    ) {
      throw new ApiError(
        'Tried to delete attainment with grades',
        HttpCode.Conflict
      );
    }

    // Other error
    throw e;
  }

  res.sendStatus(HttpCode.Ok);
};
