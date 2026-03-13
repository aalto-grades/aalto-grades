// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Router} from 'express';

import {getGlobalStatistics} from '../controllers/statistics';
import {handleInvalidRequestJson} from '../middleware';
import {jwtAuthentication} from '../middleware/authentication';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/statistics',
  jwtAuthentication,
  controllerDispatcher(getGlobalStatistics),
);

router.use('/v1/statistics', handleInvalidRequestJson);
