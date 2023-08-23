// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import passport from 'passport';

import { SystemRole } from 'aalto-grades-common/types';
import { addCourse, editCourse, getAllCourses, getCourse } from '../controllers/course';
import { handleInvalidRequestJson } from '../middleware';
import { authorization } from '../middleware/authorization';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

router.get(
  '/v1/courses/:courseId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getCourse)
);

router.get(
  '/v1/courses',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAllCourses)
);

router.post(
  '/v1/courses',
  passport.authenticate('jwt', { session: false }),
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addCourse)
);

router.put(
  '/v1/courses/:courseId',
  passport.authenticate('jwt', { session: false }),
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(editCourse)
);
