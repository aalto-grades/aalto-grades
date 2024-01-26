// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import passport from 'passport';

import {
  getCoursesOfUser,
  getUserInfo,
  addIdpUser,
  getIdpUsers,
  deleteIdpUser,
} from '../controllers/user';
import {controllerDispatcher} from '../middleware/errorHandler';
import {authorization} from '../middleware/authorization';
import { SystemRole } from '@common/types';
import {handleInvalidRequestJson} from '../middleware';

export const router: Router = Router();

router.get(
  '/v1/user/:userId/courses',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getCoursesOfUser)
);

router.get(
  '/v1/user/:userId',
  passport.authenticate('jwt', {session: false}),
  controllerDispatcher(getUserInfo)
);

router.post(
  '/v1/idp-users',
  passport.authenticate('jwt', {session: false}),
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addIdpUser)
);

router.get(
  '/v1/idp-users',
  passport.authenticate('jwt', {session: false}),
  authorization([SystemRole.Admin]),
  controllerDispatcher(getIdpUsers)
);

router.delete(
  '/v1/idp-users/:userId',
  passport.authenticate('jwt', {session: false}),
  authorization([SystemRole.Admin]),
  express.json(),
  controllerDispatcher(deleteIdpUser)
);
