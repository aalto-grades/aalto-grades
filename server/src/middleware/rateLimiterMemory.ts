// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NextFunction, Response} from 'express';
import {RateLimiterMemory} from 'rate-limiter-flexible';
import {TypedRequestBody} from 'zod-express-middleware';

import {LoginDataSchema} from '@/common/types/auth';
import logger from '../configs/winston';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'ip_',
  points: 10, // requests number
  duration: 30, // seconds before reset
  blockDuration: 15,
});

export const rateLimiterMemoryMiddleware = (
  req: TypedRequestBody<typeof LoginDataSchema>,
  res: Response,
  next: NextFunction
): void => {
  // Override res.send
  const originalSend = res.send;
  res.send = function (body) {
    if (this.statusCode === 200) {
      rateLimiter.delete(req.ip ?? '').catch(error => {
        logger.error(error);
      });
    }
    // Call the original res.send method with the body
    return originalSend.call(this, body);
  };

  rateLimiter
    .consume(req.ip ?? '')
    .then(() => {
      next();
    })
    .catch(() => {
      return res.status(429).send({
        errors: [`Try again in ${rateLimiter.blockDuration} seconds`],
      });
    });
};

export const rateLimiterMemoryMiddlewareOnFail = (
  req: TypedRequestBody<typeof LoginDataSchema>,
  res: Response,
  next: NextFunction
): void => {
  if (res.statusCode !== 200)
    rateLimiter
      .consume(req.ip ?? '')
      .then(() => {
        next();
      })
      .catch(() => {
        return res.status(429).send({
          errors: [`Try again in ${rateLimiter.blockDuration} seconds`],
        });
      });
};
