// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {ParamsDictionary, RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  addFinalGrades,
  addFinalGradesBody,
  addFinalGradesBodySchema,
  getFinalGrades,
} from '../controllers/finalGrades';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router: Router = Router();

type addFinalGradeRequestHandler = RequestHandler<
  ParamsDictionary,
  unknown,
  addFinalGradesBody
>;
router.post(
  '/v1/courses/:courseId/finalGrades',
  passport.authenticate('jwt', {session: false}) as addFinalGradeRequestHandler,
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(addFinalGradesBodySchema),
  controllerDispatcher(addFinalGrades)
);

router.get(
  '/v1/courses/:courseId/finalGrades',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getFinalGrades)
);

// router.post(
//   '/v1/courses/:courseId/finalGrades/calculate',
//   passport.authenticate('jwt', {session: false}),
//   express.json(),
//   handleInvalidRequestJson
//   //   controllerDispatcher(calculateFinalGrades)
// );
