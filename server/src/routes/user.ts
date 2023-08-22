// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Router } from 'express';
import passport from 'passport';

import { getCoursesOfUser, getUserInfo } from '../controllers/user';
import { controllerDispatcher } from '../middleware/errorHandler';

export const router: Router = Router();

router.get(
  '/v1/user/:userId/courses',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getCoursesOfUser)
);

router.get(
  '/v1/user/:userId',
  passport.authenticate('jwt', { session: false }),
  controllerDispatcher(getUserInfo)
);
