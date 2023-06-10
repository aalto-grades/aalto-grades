// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import argon from 'argon2';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { Strategy as JWTStrategy, VerifiedCallback } from 'passport-jwt';
import { IVerifyOptions, Strategy as LocalStrategy } from 'passport-local';
import * as yup from 'yup';

import { JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS } from '../configs/constants';
import { JWT_SECRET, NODE_ENV } from '../configs/environment';

import User from '../database/models/user';

import { LoginResult, SystemRole } from 'aalto-grades-common/types/auth';
import { ApiError } from '../types/error';
import { JwtClaims } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { findUserById } from './utils/user';

type PlainPassword = string;

interface SignupRequest {
  name: string,
  password: PlainPassword,
  email: string,
  studentNumber?: string,
  role?: SystemRole
}

export async function validateLogin(email: string, password: PlainPassword): Promise<LoginResult> {
  const user: User | null = await User.findByEmail(email);

  if (user === null) {
    throw new ApiError('invalid credentials', HttpCode.Unauthorized);
  }

  const match: boolean = await argon.verify(user.password.trim(), password);

  if (!match) {
    throw new ApiError('invalid credentials', HttpCode.Unauthorized);
  }

  return {
    id: user.id,
    role: user.role as SystemRole,
    name: user.name ?? '-'
  };
}

export async function authLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  passport.authenticate(
    'login',
    async (error: unknown, loginResult: LoginResult | boolean) => {
      if (error) {
        return next(error);
      }
      if (typeof loginResult === 'boolean') {
        return res.status(HttpCode.Unauthorized).send({
          success: false,
          errors: ['incorrect email or password']
        });
      }

      req.login(
        loginResult,
        { session: false },
        async (error: unknown) => {
          if (error) {
            return next(error);
          }

          const body: JwtClaims = {
            id: loginResult.id,
            role: loginResult.role
          };

          const token: string = jwt.sign(body, JWT_SECRET, {
            expiresIn: JWT_EXPIRY_SECONDS,
          });

          res.cookie('jwt', token, {
            httpOnly: true,
            secure: NODE_ENV !== 'test',
            sameSite: 'none',
            maxAge: JWT_COOKIE_EXPIRY_MS,
          });

          return res.send({
            success: true,
            data: {
              id: loginResult.id,
              role: loginResult.role as string,
              name: loginResult.name
            }
          });
        }
      );
    }
  )(req, res, next);
}

export async function authLogout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('jwt', {
    httpOnly: true,
  });

  res.send({
    success: true,
    data: {}
  });
}

export async function authSignup(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    name: yup.string().required(),
    password: yup.string().required(),
    email: yup.string().email().required(),
    studentID: yup.string().notRequired(),
    role: yup.string()
      .transform((value: string, originalValue: string) => {
        return originalValue ? originalValue.toUpperCase() : value;
      })
      .oneOf(Object.values(SystemRole))
      .notRequired()
  });

  const request: SignupRequest = await requestSchema.validate(req.body, { abortEarly: false });

  const exists: User | null = await User.findByEmail(request.email);

  if (exists) {
    throw new ApiError('user account with the specified email already exists', HttpCode.Conflict);
  }

  const newUser: User = await User.create({
    name: request.name,
    email: request.email,
    password: await argon.hash(request.password.trim()),
    studentNumber: request.studentNumber,
    role: request.role ?? SystemRole.User
  });

  const body: JwtClaims = {
    role: newUser.role as SystemRole,
    id: newUser.id
  };

  const token: string = jwt.sign(body, JWT_SECRET, {
    expiresIn: JWT_EXPIRY_SECONDS,
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: NODE_ENV !== 'test',
    sameSite: 'none',
    maxAge: JWT_COOKIE_EXPIRY_MS
  });

  res.send({
    success: true,
    data: {
      id: newUser.id,
      role: newUser.role,
      name: newUser.name
    }
  });
}

export async function authSelfInfo(req: Request, res: Response): Promise<void> {
  const user: JwtClaims = req.user as JwtClaims;

  const userFromDb: User = await findUserById(user.id, HttpCode.NotFound);

  res.send({
    success: true,
    data: {
      id: userFromDb.id,
      role: userFromDb.role,
      name: userFromDb.name
    }
  });
}

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (
      email: string,
      password: string,
      done: (error: unknown | null, user?: LoginResult | false, options?: IVerifyOptions) => void
    ) => {
      try {
        const role: LoginResult = await validateLogin(email, password);
        return done(null, role, { message: 'success' });
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          return done(null, false, { message: error.message });
        }
        return done(error);
      }
    }
  ),
);

passport.use(
  'jwt',
  new JWTStrategy(
    {
      secretOrKey: JWT_SECRET,
      jwtFromRequest: (req: Request): string | null => {
        return (req && req.cookies) ? req.cookies['jwt'] : null;
      }
    },
    async (token: JwtClaims, done: VerifiedCallback): Promise<void> => {
      try {
        return done(null, token);
      } catch(error: unknown) {
        return done(error, false);
      }
    }
  )
);
