// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {CourseRoleType, NewAplusGradeSourceArraySchema} from '@/common/types';
import {
  addAplusGradeSources,
  deleteAplusGradeSource,
  fetchAplusCourses,
  fetchAplusExerciseData,
  fetchAplusGrades,
} from '../controllers/aplus';
import {handleInvalidRequestJson} from '../middleware';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/aplus/courses',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(fetchAplusCourses)
);

router.get(
  '/v1/aplus/courses/:aplusCourseId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(fetchAplusExerciseData)
);

router.post(
  '/v1/courses/:courseId/aplus-sources',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewAplusGradeSourceArraySchema),
  controllerDispatcher(addAplusGradeSources)
);

router.delete(
  '/v1/courses/:courseId/aplus-sources/:aplusGradeSourceId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteAplusGradeSource)
);

router.get(
  '/v1/courses/:courseId/aplus-fetch',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(fetchAplusGrades)
);
