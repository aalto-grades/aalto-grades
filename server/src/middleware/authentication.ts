// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {NextFunction, Request, RequestHandler, Response} from 'express';
import passport from 'passport';

import {HttpCode} from '@/common/types/general';
import type {JwtClaims} from '../types';

export const jwtAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authenticate = passport.authenticate(
    'jwt',
    {session: false},
    (
      info: object | null,
      user: JwtClaims | false | null,
      error: object | string | Array<string | undefined>
    ) => {
      if (!user) {
        if (error instanceof Error) {
          return res.status(HttpCode.Unauthorized).send({
            errors: [error.name],
          });
        } else {
          return res.status(HttpCode.Unauthorized).send({
            errors: ['JwtAuthenticationError'],
          });
        }
      } else {
        req.user = user;
        next();
      }
    }
  ) as RequestHandler;
  authenticate(req, res, next);
};
