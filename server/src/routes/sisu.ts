// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';
import passport from 'passport';

import {
  fetchAllCourseInstancesFromSisu, fetchCourseInstanceFromSisu
} from '../controllers/sisu';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

router.get(
  '/v1/sisu/instances/:sisuCourseInstanceId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(fetchCourseInstanceFromSisu)
);

router.get(
  '/v1/sisu/courses/:courseCode',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(fetchAllCourseInstancesFromSisu)
);
