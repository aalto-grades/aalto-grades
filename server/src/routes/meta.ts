// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {Router} from 'express';

import {getClientEnvVariables} from '../controllers/meta';
import {controllerDispatcher} from '../middleware/errorHandler';

export const router = Router();

router.get(
  '/v1/client-env-variables',
  controllerDispatcher(getClientEnvVariables)
);
