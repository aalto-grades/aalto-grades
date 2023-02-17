// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import CourseAssignment from '../database/models/courseAssignment';

import { Assignment } from '../types/course';
import { HttpCode } from '../types/httpCode';
import { findCourseAssignmentById } from './utils/courseAssignment';
import { findCourseInstanceById } from './utils/courseInstance';

export async function addAssignment(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseInstanceId: yup
      .number()
      .required(),
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

  await requestSchema.validate(req.body, { abortEarly: false });
  const { courseInstanceId, name, executionDate, expiryDate }: Assignment = req.body;

  // Check that instance exists.
  await findCourseInstanceById(courseInstanceId);

  const assignment: CourseAssignment = await models.CourseAssignment.create({
    courseInstanceId: courseInstanceId,
    name: name,
    executionDate: executionDate,
    expiryDate: expiryDate
  });

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      assignment: {
        id: assignment.id
      }
    }
  });
}

export async function updateAssignment(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    id: yup
      .number()
      .required(),
    courseInstanceId: yup
      .number()
      .notRequired(),
    name: yup
      .string()
      .notRequired(),
    executionDate: yup
      .date()
      .notRequired(),
    expiryDate: yup
      .date()
      .notRequired()
  });

  const id: number = Number(req.params.assignmentId);
  await requestSchema.validate({ id: id, ...req.body }, { abortEarly: false });
  const { courseInstanceId, name, executionDate, expiryDate }: Assignment = req.body;

  const assignment: CourseAssignment = await findCourseAssignmentById(id);

  // If updating courseInstanceId, check that the instance exists.
  if (courseInstanceId) {
    await findCourseInstanceById(courseInstanceId);
  }

  await assignment.set({
    courseInstanceId: courseInstanceId ?? assignment.courseInstanceId,
    name: name ?? assignment.name,
    executionDate: executionDate ?? assignment.executionDate,
    expiryDate: expiryDate ?? assignment.expiryDate
  }).save();

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      assignment: assignment
    }
  });
}
