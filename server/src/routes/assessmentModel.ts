// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  EditAssessmentModelDataSchema,
  NewAssessmentModelDataSchema,
} from '@common/types';
import {
  addAssessmentModel,
  deleteAssessmentModel,
  getAllAssessmentModels,
  getAssessmentModel,
  updateAssessmentModel,
} from '../controllers/assessmentModel';
import {handleInvalidRequestJson} from '../middleware';
import {teacherInCharge} from '../middleware/authorization';
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
  controllerDispatcher(teacherInCharge()),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewAssessmentModelDataSchema),
  controllerDispatcher(addAssessmentModel)
);

router.put(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(teacherInCharge()),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditAssessmentModelDataSchema),
  controllerDispatcher(updateAssessmentModel)
);

router.delete(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(teacherInCharge()),
  controllerDispatcher(deleteAssessmentModel)
);
