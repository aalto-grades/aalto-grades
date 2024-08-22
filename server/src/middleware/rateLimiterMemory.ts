// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {RateLimiterMemory} from 'rate-limiter-flexible';

import {HttpCode, LoginData, ResetOwnPasswordData} from '@/common/types';
import logger from '../configs/winston';
import {SyncEndpoint} from '../types';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'ip_',
  points: 10, // requests number
  duration: 30, // seconds before reset
  blockDuration: 15,
});

export const rateLimiterMemoryMiddleware: SyncEndpoint<
  LoginData | ResetOwnPasswordData,
  void
> = (req, res, next) => {
  // Override res.send
  const originalSend = res.send;
  res.send = body => {
    if (res.statusCode === 200) {
      rateLimiter.delete(req.ip ?? '').catch(error => {
        logger.error(error);
      });
    }
    // Call the original res.send method with the body
    return originalSend.call(res, body);
  };

  rateLimiter
    .consume(req.ip ?? '')
    .then(() => {
      next();
    })
    .catch(() => {
      return res.status(HttpCode.TooManyRequests).send({
        errors: [`Try again in ${rateLimiter.blockDuration} seconds`],
      });
    });
};
