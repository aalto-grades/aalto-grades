// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData, HttpCode} from '@common/types';
import {Request, Response} from 'express';
import * as yup from 'yup';

import Attainment from '../database/models/attainment';

import {ApiError, idSchema, JwtClaims} from '../types';
import {
  findAttainmentById,
  findAttainmentsByCourseId,
} from './utils/attainment';
import {isTeacherInChargeOrAdmin} from './utils/user';

export async function getAttainments(
  req: Request,
  res: Response
): Promise<void> {
  const courseId: number = Number(req.params.courseId);

  const attainmentData = await findAttainmentsByCourseId(courseId);

  res.status(HttpCode.Ok).json({
    data: attainmentData,
  });
}

export async function getAttainment(
  req: Request,
  res: Response
): Promise<void> {
  await idSchema.validate({id: req.params.attainmentId}, {abortEarly: false});
  const attainmentId: number = Number(req.params.attainmentId);
  const courseId: number = Number(req.params.courseId);

  const attainmentList = await findAttainmentsByCourseId(courseId);

  const localRoot = attainmentList.find(
    (attainment: Partial<AttainmentData>) => attainment.id === attainmentId
  );

  if (!localRoot) {
    throw new ApiError(
      `attainment with ID ${attainmentId} not found`,
      HttpCode.NotFound
    );
  }

  res.status(HttpCode.Ok).json({
    data: localRoot,
  });
}

export async function addAttainment(
  req: Request,
  res: Response
): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    name: yup.string().required(),
    daysValid: yup.number().min(0).required(),
  });

  await requestSchema.validate(req.body, {abortEarly: false});

  const courseId = Number(req.params.courseId);

  const requestTree: AttainmentData = req.body;

  await isTeacherInChargeOrAdmin(
    req.user as JwtClaims,
    courseId,
    HttpCode.Forbidden
  );
  try {
    const dbEntry: Attainment = await Attainment.create({
      courseId: courseId,
      name: requestTree.name,
      daysValid: requestTree.daysValid,
    });

    res.status(HttpCode.Ok).json({
      data: dbEntry,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function updateAttainment(
  req: Request,
  res: Response
): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    name: yup.string().notRequired(),
    daysValid: yup.number().min(0).notRequired(),
  });

  await requestSchema.validate(req.body, {abortEarly: false});

  const courseId = Number(req.params.courseId);
  const attainmentId = Number(req.params.attainmentId);

  const requestTree: AttainmentData = req.body;

  await isTeacherInChargeOrAdmin(
    req.user as JwtClaims,
    courseId,
    HttpCode.Forbidden
  );

  const attainment: Attainment = await findAttainmentById(
    attainmentId,
    HttpCode.NotFound
  );

  await attainment
    .set({
      name: requestTree.name ?? attainment.name,
      daysValid: requestTree.daysValid ?? attainment.daysValid,
    })
    .save();

  res.status(HttpCode.Ok).json({
    // data: attainmentTree,
  });
}

export async function deleteAttainment(
  req: Request,
  res: Response
): Promise<void> {
  const courseId = Number(req.params.courseId);
  const attainmentId = Number(req.params.attainmentId);

  await isTeacherInChargeOrAdmin(
    req.user as JwtClaims,
    courseId,
    HttpCode.Forbidden
  );

  const attainment: Attainment = await findAttainmentById(
    attainmentId,
    HttpCode.NotFound
  );

  await attainment.destroy();

  res.status(HttpCode.Ok).send({
    data: {},
  });
}
