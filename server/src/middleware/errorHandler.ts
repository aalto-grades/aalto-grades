// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AxiosError } from 'axios';
import express, { NextFunction, Request, RequestHandler, Response } from 'express';
import { ValidationError } from 'yup';

import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';
import { UserExists } from '../controllers/auth';

export function controllerDispatcher<
 T, P, ResBody, ReqBody, ReqQuery, Locals extends Record<string, T>
>(
  fn: (
    req: express.Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: express.Response<ResBody, Locals>,
    next: NextFunction,
  ) => Promise<void>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
  return async (
    req: express.Request<P, ResBody, ReqBody, ReqQuery, Locals>,
    res: express.Response<ResBody, Locals>,
    next: NextFunction
  ): Promise<void> => {
    try {
      await fn(req, res, next);
      return;
    } catch (err: unknown) {
      next(err);
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
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

  if (err instanceof AxiosError) {
    res.status(HttpCode.BadGateway).send({
      success: false,
      errors: [
        err.response
          ? `external API error: ${err.response?.status}`
          : err.message
      ]
    });
  }

  // Fallback if no other error matches
  res.status(HttpCode.InternalServerError).send({
    success: false,
    errors: ['internal server error']
  });
  return;
}
