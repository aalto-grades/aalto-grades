// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AxiosError } from 'axios';
import { CsvError } from 'csv-parse';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { MulterError } from 'multer';
import { ValidationError } from 'yup';

import { ApiError, HttpCode } from '../types';

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
    console.log(`${err.name}: ${err.errors}`);

    res.status(err.statusCode);

    res.send({
      success: false,
      errors: err.errors
    });
    return;
  }

  if (err instanceof ValidationError) {
    console.log(`${err.name}: ${err.errors}`);

    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: err.errors
    });
    return;
  }

  if (err instanceof AxiosError) {
    console.log(`${err.name}: ${err.message}`);

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

    console.log(`${err.name}: ${message}`);

    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: [message]
    });
    return;
  }

  if (err instanceof Error) {
    console.log(`${err.name}: ${err.message}`);
  }

  // Fallback if no other error matches
  res.status(HttpCode.InternalServerError).send({
    success: false,
    errors: ['internal server error']
  });
  return;
}
