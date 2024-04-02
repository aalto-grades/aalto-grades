// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  SisuCSVSchema,
  addGrades,
  addGradesBodySchema,
  editUserGrade,
  editUserGradeBodySchema,
  getGrades,
  getSisuFormattedGradingCSV,
} from '../controllers/grades';
import {handleInvalidRequestJson} from '../middleware';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(getGrades)
);

// Actually gets the csv but the requirest type must be post to be able to use request.body
router.post(
  '/v1/courses/:courseId/grades/csv/sisu',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json({limit: '10mb'}),
  handleInvalidRequestJson,
  processRequestBody(SisuCSVSchema),
  controllerDispatcher(getSisuFormattedGradingCSV)
);

router.post(
  '/v1/courses/:courseId/grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json({limit: '10mb'}),
  handleInvalidRequestJson,
  processRequestBody(addGradesBodySchema),
  controllerDispatcher(addGrades)
);

router.put(
  '/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/:gradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(editUserGradeBodySchema),
  controllerDispatcher(editUserGrade)
);
