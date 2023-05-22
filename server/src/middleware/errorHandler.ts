// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AxiosError } from 'axios';
import { CsvError } from 'csv-parse';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { MulterError } from 'multer';
import { ValidationError } from 'yup';

import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';

export function controllerDispatcher(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  // TODO: appropriate logging in case of errors

  if (err instanceof ApiError) {
    res.status(err.statusCode);

    res.send({
      success: false,
      errors: err.errors
    });
    return;
  }

  if (err instanceof ValidationError) {
    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: err.errors
    });
    return;
  }

  if (err instanceof AxiosError) {
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

    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: [message]
    });
    return;
  }

  // Fallback if no other error matches
  res.status(HttpCode.InternalServerError).send({
    success: false,
    errors: ['internal server error']
  });
  return;
}
