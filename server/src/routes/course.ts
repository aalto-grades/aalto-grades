// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
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
import {jwtAuthentication} from '../middleware/authentication';
import {authorization, courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId',
  jwtAuthentication,
  courseAuthorization([
    CourseRoleType.Teacher,
    CourseRoleType.Assistant,
    CourseRoleType.Student,
  ]),
  controllerDispatcher(getCourse)
);

router.get(
  '/v1/courses',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  controllerDispatcher(getAllCourses)
);

router.post(
  '/v1/courses',
  jwtAuthentication,
  authorization([SystemRole.Admin, SystemRole.User]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewCourseDataSchema),
  controllerDispatcher(addCourse)
);

router.put(
  '/v1/courses/:courseId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditCourseDataSchema),
  controllerDispatcher(editCourse)
);
