// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';

import {CourseRoleType} from '@/common/types';
import {
  addServiceGradeSources,
  deleteServiceGradeSource,
  fetchServiceCourses,
  fetchServiceExerciseData,
  fetchServiceGrades,
} from '../controllers/extService';
import {handleInvalidRequestJson} from '../middleware';
import {apiKeyAuthentication, jwtAuthentication} from '../middleware/authentication';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/ext-source/:serviceName/courses',
  apiKeyAuthentication,
  jwtAuthentication,
  controllerDispatcher(fetchServiceCourses),
);

router.get(
  '/v1/ext-source/:serviceName/courses/:serviceCourseId',
  apiKeyAuthentication,
  jwtAuthentication,
  controllerDispatcher(fetchServiceExerciseData),
);

router.post(
  '/v1/ext-source/:serviceName/courses/:courseId/sources',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  controllerDispatcher(addServiceGradeSources),
);

router.delete(
  '/v1/ext-source/:serviceName/courses/:courseId/sources/:externalSourceId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteServiceGradeSource),
);

router.get(
  '/v1/ext-source/:serviceName/courses/:courseId/fetch',
  apiKeyAuthentication,
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(fetchServiceGrades),
);
