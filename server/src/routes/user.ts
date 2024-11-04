// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
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
import {jwtAuthentication} from '../middleware/authentication';
import {authorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/users/own-courses',
  jwtAuthentication,
  controllerDispatcher(getOwnCourses)
);

router.get(
  '/v1/users/:userId/courses/',
  jwtAuthentication,
  controllerDispatcher(getCoursesOfUser)
);

router.get(
  '/v1/users/students',
  jwtAuthentication,
  controllerDispatcher(getStudents)
);

router.get(
  '/v1/users',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  controllerDispatcher(getUsers)
);

router.post(
  '/v1/users',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewUserSchema),
  controllerDispatcher(addUser)
);

router.delete(
  '/v1/users/:userId',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  controllerDispatcher(deleteUser)
);

router.post(
  '/v1/users/delete',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  validateRequestBody(UserIdArraySchema),
  controllerDispatcher(deleteUsers)
);
