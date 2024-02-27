// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import passport from 'passport';

import {
  addAssessmentModel,
  getAllAssessmentModels,
  getAssessmentModel,
  updateAssessmentModel,
} from '../controllers/assessmentModel';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router: Router = Router();

router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getAssessmentModel)
);

router.get(
  '/v1/courses/:courseId/assessment-models',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getAllAssessmentModels)
);

router.post(
  '/v1/courses/:courseId/assessment-models',
  passport.authenticate('jwt', {session: false}),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addAssessmentModel)
);

router.put(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId',
  passport.authenticate('jwt', {session: false}),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(updateAssessmentModel)
);
