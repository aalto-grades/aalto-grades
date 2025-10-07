// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';

import {CourseRoleType, NewAplusGradeSourceArraySchema} from '@/common/types';
import {
  addAplusGradeSources,
  deleteAplusGradeSource,
  fetchAplusCourses,
  fetchAplusExerciseData,
  fetchAplusGrades,
} from '../controllers/aplus';
import {handleInvalidRequestJson} from '../middleware';
import {apiKeyAuthentication, jwtAuthentication} from '../middleware/authentication';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {processRequestBody} from '../middleware/zodValidation';

export const router = Router();

router.get(
  '/v1/aplus/courses',
  apiKeyAuthentication,
  jwtAuthentication,
  controllerDispatcher(fetchAplusCourses)
);

router.get(
  '/v1/aplus/courses/:aplusCourseId',
  apiKeyAuthentication,
  jwtAuthentication,
  controllerDispatcher(fetchAplusExerciseData)
);

router.post(
  '/v1/courses/:courseId/aplus-sources',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewAplusGradeSourceArraySchema),
  controllerDispatcher(addAplusGradeSources)
);

router.delete(
  '/v1/courses/:courseId/aplus-sources/:aplusGradeSourceId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteAplusGradeSource)
);

router.get(
  '/v1/courses/:courseId/aplus-fetch',
  apiKeyAuthentication,
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(fetchAplusGrades)
);
