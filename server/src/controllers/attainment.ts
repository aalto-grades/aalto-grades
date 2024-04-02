// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {z} from 'zod';

import {HttpCode} from '@common/types';
import Attainment from '../database/models/attainment';
import {JwtClaims} from '../types';
import {
  findAttainmentsByCourseId,
  validateAttainmentPath,
} from './utils/attainment';
import {findAndValidateCourseId} from './utils/course';
import {isTeacherInChargeOrAdmin} from './utils/user';

export const getAttainments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);
  const attainmentData = await findAttainmentsByCourseId(course.id);

  res.status(HttpCode.Ok).json({data: attainmentData});
};

export const addAttainmentBodySchema = z.object({
  name: z.string(),
  daysValid: z.number().int().min(0),
});
type AddAttainmentBody = z.infer<typeof addAttainmentBodySchema>;

export const addAttainment = async (
  req: Request<ParamsDictionary, unknown, AddAttainmentBody>,
  res: Response
): Promise<void> => {
  const course = await findAndValidateCourseId(req.params.courseId);
  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  const dbAttainment = await Attainment.create({
    courseId: course.id,
    name: req.body.name,
    daysValid: req.body.daysValid,
  });

  res.status(HttpCode.Ok).json({data: dbAttainment});
};

export const editAttainmentBodySchema = z.object({
  name: z.string(),
  daysValid: z.number().int().min(0).optional(),
});
type EditAttainmentBody = z.infer<typeof editAttainmentBodySchema>;

export async function updateAttainment(
  req: Request<ParamsDictionary, unknown, EditAttainmentBody>,
  res: Response
): Promise<void> {
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

  res.status(HttpCode.Ok).json({id: attainment.id});
}

export async function deleteAttainment(
  req: Request,
  res: Response
): Promise<void> {
  const [course, attainment] = await validateAttainmentPath(
    req.params.courseId,
    req.params.attainmentId
  );

  await isTeacherInChargeOrAdmin(req.user as JwtClaims, course.id);

  await attainment.destroy();

  res.status(HttpCode.Ok).send({id: attainment.id});
}
