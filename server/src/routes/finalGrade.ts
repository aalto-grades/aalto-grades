// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';

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
import {apiKeyAuthentication, jwtAuthentication} from '../middleware/authentication';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {processRequestBody} from '../middleware/zodValidation';

export const router = Router();

router.get(
  '/v1/courses/:courseId/final-grades',
  apiKeyAuthentication,
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getFinalGrades)
);

router.post(
  '/v1/courses/:courseId/final-grades',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewFinalGradeArraySchema),
  controllerDispatcher(addFinalGrades)
);

router.put(
  '/v1/courses/:courseId/final-grades/:finalGradeId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditFinalGradeSchema),
  controllerDispatcher(editFinalGrade)
);

router.delete(
  '/v1/courses/:courseId/final-grades/:finalGradeId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteFinalGrade)
);

// Actually gets the csv but the request type must be post to be able to use request.body
router.post(
  '/v1/courses/:courseId/final-grades/csv/sisu',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json({limit: '10mb'}),
  handleInvalidRequestJson,
  processRequestBody(SisuCsvUploadSchema),
  controllerDispatcher(getSisuFormattedGradingCSV)
);
