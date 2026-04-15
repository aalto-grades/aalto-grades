// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@/common/types';
import {aplusHandler} from './aplus';
import {moodleHandler} from './moodle';
import type {ExtServiceHandler} from './types';
import {ApiError} from '../../types';

const handlers: Record<string, ExtServiceHandler> = {
  aplus: aplusHandler,
  mycourses: moodleHandler,
};

export const getExtServiceHandler = (serviceName: string): ExtServiceHandler => {
  const handler = handlers[serviceName.toLowerCase()];
  if (!handler) {
    throw new ApiError(`Unsupported external service ${serviceName}`, HttpCode.BadRequest);
  }
  return handler;
};
