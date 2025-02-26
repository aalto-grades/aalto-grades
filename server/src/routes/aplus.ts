// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {processRequestBody} from 'zod-express-middleware';

import {CourseRoleType, NewAplusGradeSourceArraySchema} from '@/common/types';
import {
  addAplusGradeSources,
  deleteAplusGradeSource,
  fetchAplusCourses,
  fetchAplusExerciseData,
  fetchAplusGrades,
} from '../controllers/aplus';
import {handleInvalidRequestJson} from '../middleware';
import {jwtAuthentication} from '../middleware/authentication';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/aplus/courses',
  jwtAuthentication,
  controllerDispatcher(fetchAplusCourses)
);

router.get(
  '/v1/aplus/courses/:aplusCourseId',
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
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(fetchAplusGrades)
);
