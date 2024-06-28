// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NextFunction, Response} from 'express';
import {RateLimiterMemory} from 'rate-limiter-flexible';
import {TypedRequestBody} from 'zod-express-middleware';

import {LoginDataSchema} from '@/common/types/auth';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'ip_',
  points: 5, // 10 requests
  duration: 30, // per 1 second by IP
  blockDuration: 15,
});

export const rateLimiterMemoryMiddleware = (
  req: TypedRequestBody<typeof LoginDataSchema>,
  res: Response,
  next: NextFunction
): void => {
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
