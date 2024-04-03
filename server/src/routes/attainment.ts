// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  addAttainment,
  addAttainmentBodySchema,
  deleteAttainment,
  editAttainmentBodySchema,
  getAttainments,
  updateAttainment,
} from '../controllers/attainment';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/attainments',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(getAttainments)
);

router.post(
  '/v1/courses/:courseId/attainments',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(addAttainmentBodySchema),
  controllerDispatcher(addAttainment)
);

router.put(
  '/v1/courses/:courseId/attainments/:attainmentId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(editAttainmentBodySchema),
  controllerDispatcher(updateAttainment)
);

router.delete(
  '/v1/courses/:courseId/attainments/:attainmentId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(deleteAttainment)
);
