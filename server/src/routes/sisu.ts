// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Router} from 'express';

import {fetchSisuCoursesByCode} from '../controllers/sisu';
import {jwtAuthentication} from '../middleware/authentication';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/sisu/courses/:courseCode',
  jwtAuthentication,
  controllerDispatcher(fetchSisuCoursesByCode)
);
