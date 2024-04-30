// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {NewIdpUserSchema, SystemRole} from '@common/types';
import {
  addIdpUser,
  deleteIdpUser,
  getCoursesOfUser,
  getIdpUsers,
} from '../controllers/user';
import {handleInvalidRequestJson} from '../middleware';
import {adminOrOwner, authorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/user/:userId/courses',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  adminOrOwner(),
  controllerDispatcher(getCoursesOfUser)
);

router.get(
  '/v1/idp-users',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  controllerDispatcher(getIdpUsers)
);

router.post(
  '/v1/idp-users',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewIdpUserSchema),
  controllerDispatcher(addIdpUser)
);

router.delete(
  '/v1/idp-users/:userId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  controllerDispatcher(deleteIdpUser)
);
