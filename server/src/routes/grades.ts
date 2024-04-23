// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';
import {RequestHandler} from 'express-serve-static-core';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditGradeDataSchema,
  NewGradeArraySchema,
  SisuCsvUploadSchema,
} from '@common/types';
import {
  addGrades,
  deleteGrade,
  editGrade,
  getGrades,
  getSisuFormattedGradingCSV,
} from '../controllers/grades';
import {handleInvalidRequestJson} from '../middleware';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getGrades)
);

// Actually gets the csv but the requirest type must be post to be able to use request.body
router.post(
  '/v1/courses/:courseId/grades/csv/sisu',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json({limit: '10mb'}),
  handleInvalidRequestJson,
  processRequestBody(SisuCsvUploadSchema),
  controllerDispatcher(getSisuFormattedGradingCSV)
);

router.post(
  '/v1/courses/:courseId/grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json({limit: '25mb'}),
  handleInvalidRequestJson,
  processRequestBody(NewGradeArraySchema),
  controllerDispatcher(addGrades)
);

router.put(
  '/v1/courses/:courseId/grades/:gradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditGradeDataSchema),
  controllerDispatcher(editGrade)
);

router.delete(
  '/v1/courses/:courseId/grades/:gradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(deleteGrade)
);
