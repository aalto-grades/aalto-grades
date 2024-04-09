// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CreateCourseDataSchema,
  PartialCourseDataSchema,
  SystemRole,
} from '@common/types';
import {
  addCourse,
  editCourse,
  getAllCourses,
  getCourse,
} from '../controllers/course';
import {handleInvalidRequestJson} from '../middleware';
import {authorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(getCourse)
);

router.get(
  '/v1/courses',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(getAllCourses)
);

router.post(
  '/v1/courses',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(CreateCourseDataSchema),
  controllerDispatcher(addCourse)
);

router.put(
  '/v1/courses/:courseId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(PartialCourseDataSchema),
  controllerDispatcher(editCourse)
);
