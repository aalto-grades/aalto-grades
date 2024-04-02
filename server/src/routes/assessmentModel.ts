// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  addAssessmentModel,
  addAssessmentModelBodySchema,
  deleteAssessmentModel,
  getAllAssessmentModels,
  getAssessmentModel,
  updateAssessmentModel,
  updateAssessmentModelBodySchema,
} from '../controllers/assessmentModel';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(getAssessmentModel)
);

router.get(
  '/v1/courses/:courseId/assessment-models',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(getAllAssessmentModels)
);

router.post(
  '/v1/courses/:courseId/assessment-models',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(addAssessmentModelBodySchema),
  controllerDispatcher(addAssessmentModel)
);

router.put(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(updateAssessmentModelBodySchema),
  controllerDispatcher(updateAssessmentModel)
);

router.delete(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(deleteAssessmentModel)
);
