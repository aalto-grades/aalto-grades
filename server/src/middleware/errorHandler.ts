// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'yup';

import { HttpCode } from '../types/httpCode';

export class CustomError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: HttpCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomError';
  }
}

export class SisuError extends CustomError {
  public readonly sisuErrorCode: number;

  constructor(sisuErrorCode: number) {
    super(`external API error: ${sisuErrorCode}`, HttpCode.BadGateway);
    this.sisuErrorCode = sisuErrorCode;
  }
}

export function ErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  // TODO: appropriate logging in case of errors

  if (err instanceof CustomError) {
    res.status(err.statusCode);

    if (err instanceof SisuError) {
      res.send({
        success: false,
        errors: [err.message],
        sisuStatusCode: err.sisuErrorCode
      });
      return;
    }

    res.send({
      success: false,
      errors: [err.message],
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

  // Fallback if no other error matches
  res.status(HttpCode.InternalServerError).send({
    success: false,
    errors: ['internal server error']
  });
  return;
}
