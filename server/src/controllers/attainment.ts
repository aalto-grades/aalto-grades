// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';

import {AttainmentData, HttpCode, NewAttainmentData} from '@common/types';
import Attainment from '../database/models/attainment';
import {JwtClaims} from '../types';
import {
  findAttainmentsByCourseId,
  validateAttainmentPath,
} from './utils/attainment';
import {findAndValidateCourseId} from './utils/course';
import {isTeacherInChargeOrAdmin} from './utils/user';

/**
 * Responds with AttainmentData[]
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
 */
export const addAttainment = async (
  req: Request<ParamsDictionary, unknown, NewAttainmentData>,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);
  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  const newAttainment = await Attainment.create({
    courseId: course.id,
    name: req.body.name,
    daysValid: req.body.daysValid,
  });

  res.status(HttpCode.Created).json(newAttainment.id);
};

export const editAttainment = async (
  req: Request<ParamsDictionary, unknown, AttainmentData>,
  res: Response
): Promise<void> => {
  const [course, attainment] = await validateAttainmentPath(
    req.params.courseId,
    req.params.attainmentId
  );

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  await attainment
    .set({
      name: req.body.name,
      daysValid: req.body.daysValid ?? attainment.daysValid,
    })
    .save();

  res.sendStatus(HttpCode.Ok);
};

export const deleteAttainment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const [course, attainment] = await validateAttainmentPath(
    req.params.courseId,
    req.params.attainmentId
  );

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  await attainment.destroy();

  res.sendStatus(HttpCode.Ok);
};
