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

import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';
import { findUserById } from './utils/user';

// TODO: Temporary, remove or update!
export enum UserRole {
  Student = 'STUDENT',
  Teacher = 'TEACHER',
  Assistant = 'ASSISTANT',
  Admin = 'SYSADMIN'
}

export type PlainPassword = string;

export interface LoginResult {
  role: UserRole,
  id: number,
  name: string
}

export class InvalidCredentials extends Error {
  constructor() {
    super('invalid credentials');
  }
}

export async function validateLogin(email: string, password: PlainPassword): Promise<LoginResult> {
  const user: User | null = await User.findByEmail(email);

  if (user === null) {
    throw new InvalidCredentials();
  }

  const match: boolean = await argon.verify(user.password.trim(), password);

  if (!match) {
    throw new InvalidCredentials();
  }
  return {
    role: UserRole.Admin,
    id: user.id,
    name: user.name ?? ''
  };
}

export async function performSignup(
  name: string, email: string, plainPassword: PlainPassword, studentNumber: string | undefined
): Promise<number> {
  const exists: User | null = await User.findByEmail(email);

  if (exists) {
    throw new ApiError('user account with the specified email already exists', HttpCode.Conflict);
  }

  const newUser: User = await User.create({
    name: name,
    email: email,
    password: await argon.hash(plainPassword.trim()),
    studentNumber: studentNumber,
  });

  return newUser.id;
}

interface SignupRequest {
  name: string,
  password: PlainPassword,
  email: string,
  studentNumber: string | undefined,
  role: UserRole,
}

const signupSchema: yup.AnyObjectSchema = yup.object().shape({
  name: yup.string().required(),
  password: yup.string().required(),
  email: yup.string().email().required(),
  studentNumber: yup.string().notRequired(),
  role: yup.string().oneOf(Object.values(UserRole)).required(),
});

export interface JwtClaims {
  role: UserRole,
  id: number,
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
            role: loginResult.role,
            id: loginResult.id,
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
              role: loginResult.role,
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
  return;
}

export async function authSignup(req: Request, res: Response): Promise<void> {
  if (!(await signupSchema.isValid(req.body))) {
    throw new ApiError('invalid signup request format', HttpCode.BadRequest);
  }

  const request: SignupRequest = req.body as SignupRequest;

  // TODO signup
  const id: number = await performSignup(
    request.name, request.email, request.password, request.studentNumber
  );
  const body: JwtClaims = {
    role: req.body.role,
    id,
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
      id,
      role: req.body.role,
      name: request.name
    }
  });
  return;
}

export async function authSelfInfo(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new ApiError('login required', HttpCode.Unauthorized);
  }
  const user: JwtClaims = req.user as JwtClaims;

  const userFromDb: User = await findUserById(user.id, HttpCode.NotFound);

  res.send({
    success: true,
    data: {
      id: user.id,
      role: user.role,
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
        if (error instanceof InvalidCredentials) {
          return done(null, false, { message: 'invalid credentials' });
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
