// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {type RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditTaskGradeDataSchema,
  NewTaskGradeArraySchema,
  SisuCsvUploadSchema,
  SystemRole,
  UserIdArraySchema,
} from '@/common/types';
import {
  addGrades,
  deleteGrade,
  editGrade,
  getGrades,
  getLatestGrades,
  getSisuFormattedGradingCSV,
} from '../controllers/taskGrade';
import {handleInvalidRequestJson} from '../middleware';
import {authorization, courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getGrades)
);

router.post(
  '/v1/courses/:courseId/grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json({limit: '25mb'}),
  handleInvalidRequestJson,
  processRequestBody(NewTaskGradeArraySchema),
  controllerDispatcher(addGrades)
);

router.put(
  '/v1/courses/:courseId/grades/:gradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditTaskGradeDataSchema),
  controllerDispatcher(editGrade)
);

router.delete(
  '/v1/courses/:courseId/grades/:gradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(deleteGrade)
);

// Actually gets the data but the request type must be post to be able to use request.body
router.post(
  '/v1/latest-grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  authorization([SystemRole.Admin]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(UserIdArraySchema),
  controllerDispatcher(getLatestGrades)
);

// Actually gets the csv but the request type must be post to be able to use request.body
router.post(
  '/v1/courses/:courseId/grades/csv/sisu',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json({limit: '10mb'}),
  handleInvalidRequestJson,
  processRequestBody(SisuCsvUploadSchema),
  controllerDispatcher(getSisuFormattedGradingCSV)
);
