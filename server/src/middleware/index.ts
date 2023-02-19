// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';

interface JsonError extends Error {
  expose?: boolean,
  status?: number,
  statusCode?: number,
  body?: string,
  type?: string
}

// Middleware function for handling errors in JSON parsing.
export function handleInvalidRequestJson(
  err: JsonError, req: Request, res: Response, next: NextFunction
): void {
  if (err instanceof SyntaxError && err.status === 400 && err.body !== undefined) {
    res.status(400).send({
      success: false,
      errors: [ `SyntaxError: ${err.message}: ${err.body}` ]
    });
  } else {
    next();
  }
}
