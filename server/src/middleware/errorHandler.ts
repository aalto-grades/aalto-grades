// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from 'aalto-grades-common/types';
import {AxiosError} from 'axios';
import {CsvError} from 'csv-parse';
import {NextFunction, Request, RequestHandler, Response} from 'express';
import {MulterError} from 'multer';
import {ValidationError} from 'yup';

import logger from '../configs/winston';
import {ApiError} from '../types';

/**
 * Creates a RequestHandler wrapper function that executes a given handler and
 * automatically catches any errors.
 * This utility function can be used to avoid repetitive try-catch blocks in
 * every controller function.
 * For more information:
 * https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
 *
 * @param {Function} handler - The handler function to be executed.
 * @returns {RequestHandler} Returns a RequestHandler that executes the handler and catches
 * any errors, passing them to the next middleware.
 *
 * @example
 * // Wrap your async controller with `controllerDispatcher`:
 * app.post('/v1/course', controllerDispatcher(async (req, res, next) => { ... }));
 */
export function controllerDispatcher(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

/**
 * Centralized error handling middleware.
 * This middleware checks the type of error and sends an appropriate HTTP response.
 * It's designed to handle specific known error types, such as those from validation libraries,
 * and provides a generic catch-all for unanticipated errors.
 * Logging is also performed for each error type.
 * @param {unknown} err - The error object that was thrown.
 * @param {Request} _req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} _next - The next function in the middleware chain.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    logger.error(`${err.name}: ${err.statusCode} - ${err.errors}`);

    res.status(err.statusCode).send({
      success: false,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof ValidationError) {
    logger.error(`${err.name}: ${err.errors}`);

    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AxiosError) {
    logger.error(`${err.name}: ${err.message}`);

    res.status(HttpCode.BadGateway).send({
      success: false,
      errors: [
        err.response
          ? `external API error: ${err.response?.status}`
          : err.message,
      ],
    });
    return;
  }

  if (err instanceof CsvError || err instanceof MulterError) {
    // If field name is incorrect, change the error message to more informative.
    const message: string =
      err.message === 'Unexpected field'
        ? 'Unexpected field. To upload CSV file, set input field name as "csv_data"'
        : err.message;

    logger.error(`${err.name}: ${message}`);

    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: [message],
    });
    return;
  }

  if (err instanceof Error) {
    logger.error(`${err.name}: ${err.message}`);
  }

  // Fallback if no other error matches
  res.status(HttpCode.InternalServerError).send({
    success: false,
    errors: ['internal server error'],
  });
  return;
}
