// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';
import passport from 'passport';

import { JwtClaims } from '../controllers/auth';
import { HttpCode } from '../types/httpCode';

export function authorization(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false }, (err: unknown, user: JwtClaims | boolean) => {
    if (err || !user) {
      res.status(HttpCode.Unauthorized).json({
        success: false,
        errors: ['unauthorized']
      });
      return;
    }
    next();
  })(req, res, next);
}
