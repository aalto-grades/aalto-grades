// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {CourseRoleType, NewAplusGradeSourceArraySchema} from '@/common/types';
import {
  addAplusGradeSources,
  fetchAplusExerciseData,
  fetchAplusGrades,
} from '../controllers/aplus';
import {handleInvalidRequestJson} from '../middleware';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

// TODO: Authorization?
router.get(
  '/v1/aplus/courses/:aplusCourseId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(fetchAplusExerciseData)
);

router.post(
  '/v1/courses/:courseId/aplus-source',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewAplusGradeSourceArraySchema),
  controllerDispatcher(addAplusGradeSources)
);

router.get(
  '/v1/courses/:courseId/aplus-fetch',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(fetchAplusGrades)
);
