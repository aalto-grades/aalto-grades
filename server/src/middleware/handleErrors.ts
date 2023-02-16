// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';

// TODO: add correct return type and fn type.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleErrors(fn: any): any {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
      return;
    } catch (err: unknown) {
      next(err);
    }
  };
}