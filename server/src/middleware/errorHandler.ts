// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'yup';

import { HttpCode } from '../types/httpCode';
import { UserExists } from '../controllers/auth';

export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: HttpCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function ErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  // TODO: appropriate logging in case of errors

  if (err instanceof ApiError) {
    res.status(err.statusCode);

    res.send({
      success: false,
      errors: [err.message],
    });
    return;
  }

  if (err instanceof UserExists) {
    res.status(HttpCode.Conflict).send({
      success: false,
      errors: ['user account with the specified email already exists']
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
