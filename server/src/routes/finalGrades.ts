// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import express, {RequestHandler, Router} from 'express';
import passport from 'passport';
import {processRequestBody} from 'zod-express-middleware';

import {
  CourseRoleType,
  EditFinalGradeSchema,
  NewFinalGradeArraySchema,
} from '@/common/types';
import {
  addFinalGrades,
  deleteFinalGrade,
  editFinalGrade,
  getFinalGrades,
} from '../controllers/finalGrades';
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
  '/v1/courses/:courseId/final-grades/:fGradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditFinalGradeSchema),
  controllerDispatcher(editFinalGrade)
);

router.delete(
  '/v1/courses/:courseId/final-grades/:fGradeId',
  passport.authenticate('jwt', {session: false}) as RequestHandler,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteFinalGrade)
);
