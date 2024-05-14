// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AxiosError} from 'axios';
import {NextFunction, Request, RequestHandler, Response} from 'express';

import {HttpCode} from '@/common/types';
import logger from '../configs/winston';
import {ApiError} from '../types';

/**
 * Creates a RequestHandler wrapper function that executes a given handler and
 * automatically catches any errors. This utility function can be used to avoid
 * repetitive try-catch blocks in every controller function. For more
 * information:
 * https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
 *
 * @example
 *   // Wrap your async controller with `controllerDispatcher`:
 *   app.post('/v1/course', controllerDispatcher(async (req, res, next) => { ... }));
 */
export function controllerDispatcher(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

/**
 * Centralized error handling middleware. This middleware checks the type of
 * error and sends an appropriate HTTP response. It's designed to handle
 * specific known error types, such as those from validation libraries, and
 * provides a generic catch-all for unanticipated errors. Logging is also
 * performed for each error type.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ApiError) {
    logger.error(`${err.name}: ${err.statusCode} - ${err.errors.toString()}`);

    res.status(err.statusCode).send({
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AxiosError) {
    logger.error(`${err.name}: ${err.message}`);

    res.status(HttpCode.BadGateway).send({
      errors: [
        err.response
          ? `external API error: ${err.response.status}`
          : err.message,
      ],
    });
    return;
  }

  if (err instanceof Error) {
    logger.error(`${err.name}: ${err.message}`);
  }

  // Fallback if no other error matches
  res.status(HttpCode.InternalServerError).send({
    errors: ['internal server error'],
  });
  return;
};
