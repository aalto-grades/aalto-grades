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
import { JWT_SECRET, TEST_ENV } from '../configs/environment';

import { HttpCode } from '../types/httpCode';
import User from '../database/models/user';
import { UserRole } from '../types/user';

export type PlainPassword = string;

export interface LoginResult {
  role: UserRole,
  id: number,
}

export class InvalidCredentials extends Error {
  constructor() {
    super('invalid credentials');
  }
}

export class UserExists extends Error {
  constructor() {
    super('user exists already');
  }
}

export class InvalidFormat extends Error {
  constructor() {
    super('credential format is invalid, possibly bad email');
  }
}

export async function validateLogin(email: string, password: PlainPassword): Promise<LoginResult> {
  const user: User | null = await User.findOne({
    attributes: ['id', 'password'],
    where: {
      email: email,
    }
  });
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
  };
}

export async function performSignup(
  name: string, email: string, plainPassword: PlainPassword, studentId: string | undefined
): Promise<number> {
  const exists: User | null = await User.findOne({
    where: {
      email: email,
    }
  });

  if (exists !== null) {
    throw new UserExists();
  }

  try {
    const model: User = await User.create({
      name: name,
      email: email,
      password: await argon.hash(plainPassword.trim()),
      studentId: studentId,
    });
    return model.id;
  } catch (_e) {
    throw new InvalidFormat();
  }
}

interface SignupRequest {
  name: string,
  password: PlainPassword,
  email: string,
  studentID: string | undefined,
  role: UserRole,
}

const signupSchema: yup.AnyObjectSchema = yup.object().shape({
  name: yup.string().required(),
  password: yup.string().required(),
  email: yup.string().required(),
  studentID: yup.string().notRequired(),
  role: yup.string().oneOf([
    UserRole.Admin,
    UserRole.Assistant,
    UserRole.Student,
    UserRole.Teacher
  ]).required(),
});

interface JwtClaims {
  role: UserRole,
  id: number,
}

export async function authLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  passport.authenticate(
    'login',
    async (err: unknown, loginResult: LoginResult | boolean) => {
      if (err) {
        return next(err);
      }
      if (loginResult == false || loginResult == true) {
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
            secure: !TEST_ENV,
            sameSite: 'none',
            maxAge: JWT_COOKIE_EXPIRY_MS,
          });
          return res.send({
            success: true,
            data: {
              role: loginResult.role,
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
    success: true
  });
  return;
}

export async function authSignup(req: Request, res: Response): Promise<void> {
  if (!(await signupSchema.isValid(req.body))) {
    res.status(HttpCode.BadRequest).send({
      success: false,
      errors: ['invalid signup request format']
    });
    return;
  }

  const request: SignupRequest = req.body as SignupRequest;

  // TODO signup
  const id: number = await performSignup(
    request.name, request.email, request.password, request.studentID
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
    secure: !TEST_ENV,
    sameSite: 'none',
    maxAge: JWT_COOKIE_EXPIRY_MS
  });
  res.send({
    success: true,
    data: {
      role: req.body.role,
      id
    }
  });
  return;
}

export async function authSelfInfo(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(HttpCode.Unauthorized);
    res.send({ success: false, error: 'login required' });
    return;
  }
  const user: JwtClaims = req.user as JwtClaims;
  res.send({
    success: true,
    data: {
      id: user.id,
      role: user.role,
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
      } catch (error) {
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
      } catch(e) {
        return done(e);
      }
    }
  )
);
