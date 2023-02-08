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
  name: string, email: string, plainPassword: PlainPassword, studentId: string
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
  studentID: string,
  role: UserRole,
}

const signupSchema: yup.AnyObjectSchema = yup.object().shape({
  name: yup.string().required(),
  password: yup.string().required(),
  email: yup.string().required(),
  studentID: yup.string().required(),
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
    async (
      err: unknown,
      loginResult: LoginResult | boolean,
      options: IVerifyOptions | null | undefined
    ) => {
      try {
        if (err) {
          return next(err);
        }
        if (loginResult == false || loginResult == true) {
          return res.status(401).send({
            success: false,
            message: options ? options.message : 'unknown error',
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
              role: loginResult.role,
            });
          }
        );
      } catch (error) {
        return next(error);
      }
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
}

export async function authSignup(req: Request, res: Response): Promise<void> {
  if (!(await signupSchema.isValid(req.body))) {
    res.status(400).send({
      success: false,
      error: 'Invalid signup request format',
    });
    return;
  }

  const request: SignupRequest = req.body as SignupRequest;

  try {
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
      maxAge: JWT_COOKIE_EXPIRY_MS // one day
    });
    res.send({
      success: true,
      role: req.body.role,
      id,
    });
  } catch (error) {
    // 403 or 400 or 500? The Promise architecture with appropriate rejections should
    // carry this info
    res.status(400).send({
      success: false,
      error: error instanceof Error ? error.message : 'unknown error',
    });
  }
}

export async function authSelfInfo(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401);
    res.send({ success: false, error: 'unauthorized' });
    return;
  }
  const user: JwtClaims = req.user as JwtClaims;
  res.send({
    id: user.id,
    role: user.role,
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
      done: (
        error: unknown | null,
        user?: LoginResult | false,
        options?: IVerifyOptions
      ) => void
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
