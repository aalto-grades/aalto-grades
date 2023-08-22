// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, { Router } from 'express';
import passport from 'passport';

import {
  addCourseInstance, getAllCourseInstances, getCourseInstance
} from '../controllers/courseInstance';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

router.get(
  '/v1/courses/:courseId/instances/:instanceId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getCourseInstance)
);

router.get(
  '/v1/courses/:courseId/instances',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getAllCourseInstances)
);

router.post(
  '/v1/courses/:courseId/instances',
  passport.authenticate('jwt', { session: false }),
  express.json(),
  controllerDispatcher(addCourseInstance)
);
