// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';

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
import {apiKeyAuthentication, jwtAuthentication} from '../middleware/authentication';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {processRequestBody} from '../middleware/zodValidation';

export const router = Router();

router.get(
  '/v1/courses/:courseId/parts',
  apiKeyAuthentication,
  jwtAuthentication,
  courseAuthorization([
    CourseRoleType.Teacher,
    CourseRoleType.Assistant,
    CourseRoleType.Student,
  ]),
  controllerDispatcher(getCourseParts)
);

router.post(
  '/v1/courses/:courseId/parts',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewCoursePartDataSchema),
  controllerDispatcher(addCoursePart)
);

router.put(
  '/v1/courses/:courseId/parts/:coursePartId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditCoursePartDataSchema),
  controllerDispatcher(editCoursePart)
);

router.delete(
  '/v1/courses/:courseId/parts/:coursePartId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteCoursePart)
);
