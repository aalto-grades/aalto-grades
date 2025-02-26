// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {processRequestBody} from 'zod-express-middleware';

import {CourseRoleType, ModifyCourseTasksSchema} from '@/common/types';
import {getCourseTasks, modifyCourseTasks} from '../controllers/courseTask';
import {handleInvalidRequestJson} from '../middleware';
import {jwtAuthentication} from '../middleware/authentication';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/tasks',
  jwtAuthentication,
  courseAuthorization([
    CourseRoleType.Teacher,
    CourseRoleType.Assistant,
    CourseRoleType.Student,
  ]),
  controllerDispatcher(getCourseTasks)
);

router.post(
  '/v1/courses/:courseId/tasks',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(ModifyCourseTasksSchema),
  controllerDispatcher(modifyCourseTasks)
);
