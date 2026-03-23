// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import express, {Router} from 'express';

import {
  CourseRoleType,
  EditWaitListEntryArraySchema,
  NewWaitListEntryArraySchema,
  WaitListEntryIdArraySchema,
  WaitListImportEntryArraySchema,
  WaitListReleaseSchema,
} from '@/common/types';
import {
  addWaitListEntries,
  deleteWaitListEntries,
  editWaitListEntries,
  getWaitList,
  importWaitListEntries,
  releaseWaitListEntries,
} from '../controllers/waitList';
import {handleInvalidRequestJson} from '../middleware';
import {apiKeyAuthentication, jwtAuthentication} from '../middleware/authentication';
import {courseAuthorization} from '../middleware/authorization';
import {controllerDispatcher} from '../middleware/errorHandler';
import {processRequestBody} from '../middleware/zodValidation';

export const router = Router();

router.get(
  '/v1/courses/:courseId/wait-list',
  apiKeyAuthentication,
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  controllerDispatcher(getWaitList)
);

router.post(
  '/v1/courses/:courseId/wait-list',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(NewWaitListEntryArraySchema),
  controllerDispatcher(addWaitListEntries)
);

router.put(
  '/v1/courses/:courseId/wait-list',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(EditWaitListEntryArraySchema),
  controllerDispatcher(editWaitListEntries)
);

router.post(
  '/v1/courses/:courseId/wait-list/import',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(WaitListImportEntryArraySchema),
  controllerDispatcher(importWaitListEntries)
);

router.post(
  '/v1/courses/:courseId/wait-list/release',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(WaitListReleaseSchema),
  controllerDispatcher(releaseWaitListEntries)
);

router.post(
  '/v1/courses/:courseId/wait-list/delete',
  jwtAuthentication,
  courseAuthorization([CourseRoleType.Teacher, CourseRoleType.Assistant]),
  express.json(),
  handleInvalidRequestJson,
  processRequestBody(WaitListEntryIdArraySchema),
  controllerDispatcher(deleteWaitListEntries)
);
