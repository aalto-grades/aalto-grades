// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {AddIdpUserSchema, SystemRole} from '@common/types';
import {
  addIdpUser,
  deleteIdpUser,
  getCoursesOfUser,
  getIdpUsers,
} from '../controllers/user';
import {handleInvalidRequestJson} from '../middleware';
import {authorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/user/:userId/courses',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  controllerDispatcher(getCoursesOfUser)
);

router.post(
  '/v1/idp-users',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(AddIdpUserSchema),
  controllerDispatcher(addIdpUser)
);

router.get(
  '/v1/idp-users',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  controllerDispatcher(getIdpUsers)
);

router.delete(
  '/v1/idp-users/:userId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  controllerDispatcher(deleteIdpUser)
);
