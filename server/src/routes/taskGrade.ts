// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';

import {
  CourseRoleType,
  EditTaskGradeDataSchema,
  NewTaskGradeArraySchema,
  SystemRole,
  UserIdArraySchema,
} from '@/common/types';
import {
  addGrades,
  deleteGrade,
  editGrade,
  getGradeLogs,
  getGrades,
  getLatestGrades,
} from '../controllers/taskGrade';
import {handleInvalidRequestJson} from '../middleware';
import {jwtAuthentication} from '../middleware/authentication';
import {authorization, courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {processRequestBody} from '../middleware/zodValidation';

export const router = Router();

router.get(
  '/v1/courses/:courseId/grades',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getGrades)
);

router.get(
  '/v1/grade-logs',
  jwtAuthentication,
  controllerDispatcher(getGradeLogs)
);

router.post(
  '/v1/courses/:courseId/grades',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json({limit: '25mb'}),
  handleInvalidRequestJson,
  processRequestBody(NewTaskGradeArraySchema),
  controllerDispatcher(addGrades)
);

router.put(
  '/v1/courses/:courseId/grades/:gradeId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditTaskGradeDataSchema),
  controllerDispatcher(editGrade)
);

router.delete(
  '/v1/courses/:courseId/grades/:gradeId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(deleteGrade)
);

// Actually gets the data but the request type must be post to be able to use request.body
router.post(
  '/v1/latest-grades',
  jwtAuthentication,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(UserIdArraySchema),
  controllerDispatcher(getLatestGrades)
);
