// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {type RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditGradingModelDataSchema,
  NewGradingModelDataSchema,
} from '@/common/types';
import {
  addGradingModel,
  deleteGradingModel,
  editGradingModel,
  getAllGradingModels,
  getGradingModel,
} from '../controllers/gradingModel';
import {handleInvalidRequestJson} from '../middleware';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/grading-models/:gradingModelId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getGradingModel)
);

router.get(
  '/v1/courses/:courseId/grading-models',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getAllGradingModels)
);

router.post(
  '/v1/courses/:courseId/grading-models',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewGradingModelDataSchema),
  controllerDispatcher(addGradingModel)
);

router.put(
  '/v1/courses/:courseId/grading-models/:gradingModelId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditGradingModelDataSchema),
  controllerDispatcher(editGradingModel)
);

router.delete(
  '/v1/courses/:courseId/grading-models/:gradingModelId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteGradingModel)
);
