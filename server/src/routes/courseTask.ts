// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {type RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditCourseTaskSchema,
  NewCourseTaskSchema,
} from '@/common/types';
import {
  addCourseTask,
  deleteCourseTask,
  editCourseTask,
  getCourseTasks,
} from '../controllers/courseTask';
import {handleInvalidRequestJson} from '../middleware';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/tasks',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([
    CourseRoleType.Teacher,
    CourseRoleType.Assistant,
    CourseRoleType.Student,
  ]),
  controllerDispatcher(getCourseTasks)
);

router.post(
  '/v1/courses/:courseId/tasks',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewCourseTaskSchema),
  controllerDispatcher(addCourseTask)
);

router.put(
  '/v1/courses/:courseId/tasks/:courseTaskId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditCourseTaskSchema),
  controllerDispatcher(editCourseTask)
);

router.delete(
  '/v1/courses/:courseId/tasks/:courseTaskId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteCourseTask)
);
