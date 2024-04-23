// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {NewFinalGradeArraySchema} from '@common/types';
import {addFinalGrades, getFinalGrades} from '../controllers/finalGrades';
import {handleInvalidRequestJson} from '../middleware';
import {teacherInCharge} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.post(
  '/v1/courses/:courseId/finalGrades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  teacherInCharge(),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewFinalGradeArraySchema),
  controllerDispatcher(addFinalGrades)
);

router.get(
  '/v1/courses/:courseId/finalGrades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  teacherInCharge(),
  controllerDispatcher(getFinalGrades)
);
