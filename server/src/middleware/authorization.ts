// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';

import { JwtClaims, SystemRole } from '../types/general';
import { HttpCode } from '../types/httpCode';

export function authorization(
  allowedRoles: Array<SystemRole>
): (req: Request, res: Response, next: NextFunction) => void {

  return async function (req: Request, res: Response, next: NextFunction) {
    const user: JwtClaims = req.user as JwtClaims;

    if (!allowedRoles.includes(user.role)) {
      res.status(HttpCode.Forbidden).send({
        success: false,
        errors: ['forbidden']
      });
      return;
    }
    next();
  };
}