// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';

import {
  CourseRoleType,
  EditGradingModelDataSchema,
  NewGradingModelDataSchema,
} from '@/common/types';
import {
  addGradingModel,
  deleteGradingModel,
  editGradingModel,
  getAllGradingModels,
  getGradingModel,
} from '../controllers/gradingModel';
import {handleInvalidRequestJson} from '../middleware';
import {apiKeyAuthentication, jwtAuthentication} from '../middleware/authentication';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {processRequestBody} from '../middleware/zodValidation';

export const router = Router();

router.get(
  '/v1/courses/:courseId/grading-models/:gradingModelId',
  apiKeyAuthentication,
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getGradingModel)
);

router.get(
  '/v1/courses/:courseId/grading-models',
  apiKeyAuthentication,
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getAllGradingModels)
);

router.post(
  '/v1/courses/:courseId/grading-models',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewGradingModelDataSchema),
  controllerDispatcher(addGradingModel)
);

router.put(
  '/v1/courses/:courseId/grading-models/:gradingModelId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditGradingModelDataSchema),
  controllerDispatcher(editGradingModel)
);

router.delete(
  '/v1/courses/:courseId/grading-models/:gradingModelId',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher]),
  controllerDispatcher(deleteGradingModel)
);
