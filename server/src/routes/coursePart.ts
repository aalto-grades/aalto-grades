// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditCoursePartDataSchema,
  NewCoursePartDataSchema,
} from '@/common/types';
import {
  addCoursePart,
  deleteCoursePart,
  editCoursePart,
  getCourseParts,
} from '../controllers/coursePart';
import {handleInvalidRequestJson} from '../middleware';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {authLogger} from '../middleware/requestLogger';

export const router = Router();

router.get(
  '/v1/courses/:courseId/parts',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogger,
  courseAuthorization([
    CourseRoleType.Teacher,
    CourseRoleType.Assistant,
    CourseRoleType.Student,
  ]),
  controllerDispatcher(getCourseParts)
);

router.post(
  '/v1/courses/:courseId/parts',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  authLogger,
  courseAuthorization([CourseRoleType.Teacher]),
  processRequestBody(NewCoursePartDataSchema),
  controllerDispatcher(addCoursePart)
);

router.put(
  '/v1/courses/:courseId/parts/:coursePartId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  express.json(),
  handleInvalidRequestJson,
  authLogger,
  courseAuthorization([CourseRoleType.Teacher]),
  processRequestBody(EditCoursePartDataSchema),
  controllerDispatcher(editCoursePart)
);

router.delete(
  '/v1/courses/:courseId/parts/:coursePartId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authLogger,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteCoursePart)
);
