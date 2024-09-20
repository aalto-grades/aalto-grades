// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {type RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditFinalGradeSchema,
  NewFinalGradeArraySchema,
  SisuCsvUploadSchema,
} from '@/common/types';
import {
  addFinalGrades,
  deleteFinalGrade,
  editFinalGrade,
  getFinalGrades,
  getSisuFormattedGradingCSV,
} from '../controllers/finalGrade';
import {handleInvalidRequestJson} from '../middleware';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/courses/:courseId/final-grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getFinalGrades)
);

router.post(
  '/v1/courses/:courseId/final-grades',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewFinalGradeArraySchema),
  controllerDispatcher(addFinalGrades)
);

router.put(
  '/v1/courses/:courseId/final-grades/:finalGradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditFinalGradeSchema),
  controllerDispatcher(editFinalGrade)
);

router.delete(
  '/v1/courses/:courseId/final-grades/:finalGradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteFinalGrade)
);

// Actually gets the csv but the request type must be post to be able to use request.body
router.post(
  '/v1/courses/:courseId/final-grades/csv/sisu',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json({limit: '10mb'}),
  handleInvalidRequestJson,
  processRequestBody(SisuCsvUploadSchema),
  controllerDispatcher(getSisuFormattedGradingCSV)
);
