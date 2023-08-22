// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import passport from 'passport';

import {
  addAttainment,
  deleteAttainment,
  updateAttainment,
  getRootAttainment,
  getAttainment
} from '../controllers/attainment';
import { handleInvalidRequestJson } from '../middleware';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAttainment)
);

router.get(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getRootAttainment)
);

router.post(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addAttainment)
);

router.put(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(updateAttainment)
);

router.delete(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(deleteAttainment)
);
