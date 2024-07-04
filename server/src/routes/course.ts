// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditCourseDataSchema,
  NewCourseDataSchema,
  SystemRole,
} from '@/common/types';
import {
  addCourse,
  editCourse,
  getAllCourses,
  getCourse,
} from '../controllers/course';
import {handleInvalidRequestJson} from '../middleware';
import {authorization, courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([
    CourseRoleType.Teacher,
    CourseRoleType.Assistant,
    CourseRoleType.Student,
  ]),
  controllerDispatcher(getCourse)
);

router.get(
  '/v1/courses',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  controllerDispatcher(getAllCourses)
);

router.post(
  '/v1/courses',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewCourseDataSchema),
  controllerDispatcher(addCourse)
);

router.put(
  '/v1/courses/:courseId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditCourseDataSchema),
  controllerDispatcher(editCourse)
);
