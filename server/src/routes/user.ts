// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody, validateRequestBody} from 'zod-express-middleware';

import {NewUserSchema, SystemRole, UserIdArraySchema} from '@/common/types';
import {
  addUser,
  deleteUser,
  deleteUsers,
  getCoursesOfUser,
  getOwnCourses,
  getStudents,
  getUsers,
} from '../controllers/user';
import {handleInvalidRequestJson} from '../middleware';
import {authorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {authLogger} from '../middleware/requestLogger';

export const router = Router();

router.get(
  '/v1/users/own-courses',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogger,
  controllerDispatcher(getOwnCourses)
);

router.get(
  '/v1/users/:userId/courses/',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogger,
  controllerDispatcher(getCoursesOfUser)
);

router.get(
  '/v1/users/students',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogger,
  controllerDispatcher(getStudents)
);

router.get(
  '/v1/users',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogger,
  authorization([SystemRole.Admin]),
  controllerDispatcher(getUsers)
);

router.post(
  '/v1/users',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  authLogger,
  authorization([SystemRole.Admin]),
  processRequestBody(NewUserSchema),
  controllerDispatcher(addUser)
);

router.delete(
  '/v1/users/:userId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogger,
  authorization([SystemRole.Admin]),
  controllerDispatcher(deleteUser)
);

router.post(
  '/v1/users/delete',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  authLogger,
  authorization([SystemRole.Admin]),
  validateRequestBody(UserIdArraySchema),
  controllerDispatcher(deleteUsers)
);
