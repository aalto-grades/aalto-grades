// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {NextFunction, Request, Response} from 'express';

type JsonError = {
  expose?: boolean;
  status?: number;
  statusCode?: number;
  body?: string;
  type?: string;
} & Error;

/**
 * Middleware function to handle JSON parsing errors in requests. If the error
 * is a SyntaxError with a status of 400 (indicating a client-side error), and
 * the original request body is available, it responds with an error message
 * detailing the syntax issue. If these conditions aren't met, it passes control
 * to the next middleware in the chain.
 *
 * @example
 *   // Use this middleware to catch and respond to JSON parsing errors.
 *   app.use(handleInvalidRequestJson);
 */
export const handleInvalidRequestJson = (
  err: JsonError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    err.body !== undefined
  ) {
    res.status(400).send({
      errors: [`SyntaxError: ${err.message}: ${err.body}`],
    });
  } else {
    next();
  }
};
