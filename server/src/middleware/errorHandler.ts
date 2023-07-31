// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { HttpCode } from 'aalto-grades-common/types';
import { AxiosError } from 'axios';
import { CsvError } from 'csv-parse';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { MulterError } from 'multer';
import { ValidationError } from 'yup';

import logger from '../configs/winston';
import { ApiError } from '../types';

export function controllerDispatcher(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {

  if (err instanceof ApiError) {
    logger.error(`${err.name}: ${err.statusCode} - ${err.errors}`);

    res.status(err.statusCode).send({
      success: false,
      errors: err.errors
    });
    return;
  }

  if (err instanceof ValidationError) {
    logger.error(`${err.name}: ${err.errors}`);

    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: err.errors
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
          : err.message
      ]
    });
    return;
  }

  if (err instanceof CsvError || err instanceof MulterError) {
    // If field name is incorrect, change the error message to more informative.
    const message: string = err.message === 'Unexpected field' ?
      'Unexpected field. To upload CSV file, set input field name as "csv_data"' :
      err.message;

    logger.error(`${err.name}: ${message}`);

    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: [message]
    });
    return;
  }

  if (err instanceof Error) {
    logger.error(`${err.name}: ${err.message}`);
  }

  // Fallback if no other error matches
  res.status(HttpCode.InternalServerError).send({
    success: false,
    errors: ['internal server error']
  });
  return;
}
