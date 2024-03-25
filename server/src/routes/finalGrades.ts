// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import passport from 'passport';

import {addFinalGrades, getFinalGrades} from '../controllers/finalGrades';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router: Router = Router();

router.post(
  '/v1/courses/:courseId/finalGrades',
  passport.authenticate('jwt', {session: false}),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addFinalGrades)
);

router.get(
  '/v1/courses/:courseId/finalGrades',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getFinalGrades)
);

router.post(
  '/v1/courses/:courseId/finalGrades/calculate',
  passport.authenticate('jwt', {session: false}),
  express.json(),
  handleInvalidRequestJson
  //   controllerDispatcher(calculateFinalGrades)
);
