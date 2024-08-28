// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {CourseRoleType, ModifyCourseTasksSchema} from '@/common/types';
import {getCourseTasks, modifyCourseTasks} from '../controllers/courseTask';
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
  processRequestBody(ModifyCourseTasksSchema),
  controllerDispatcher(modifyCourseTasks)
);
