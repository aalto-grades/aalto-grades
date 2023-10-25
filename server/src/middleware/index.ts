// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NextFunction, Request, Response} from 'express';

interface JsonError extends Error {
  expose?: boolean;
  status?: number;
  statusCode?: number;
  body?: string;
  type?: string;
}

/**
 * Middleware function to handle JSON parsing errors in requests.
 * If the error is a SyntaxError with a status of 400 (indicating a client-side error), and the
 * original request body is available, it responds with an error message detailing the syntax issue.
 * If these conditions aren't met, it passes control to the next middleware in the chain.
 *
 * @param {JsonError} err - The error object that was thrown.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 *
 * @example
 * // Use this middleware to catch and respond to JSON parsing errors.
 * app.use(handleInvalidRequestJson);
 */
export function handleInvalidRequestJson(
  err: JsonError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    err.body !== undefined
  ) {
    res.status(400).send({
      success: false,
      errors: [`SyntaxError: ${err.message}: ${err.body}`],
    });
  } else {
    next();
  }
}
