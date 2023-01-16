// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Strategy as JWTStrategy, VerifiedCallback } from 'passport-jwt';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';
import { UserRole, PlainPassword, validateLogin, InvalidCredentials, performSignup, LoginResult } from '../controllers/auth';
import { Strategy as LocalStrategy } from 'passport-local';
import { jwtSecret } from '../configs';

interface SignupRequest {
  username: string,
  password: PlainPassword,
  email: string,
  studentID: string,
  role: UserRole,
}

interface JwtClaims {
  role: UserRole,
  id: number,
}

function validateUserRole(role: any): role is UserRole {
  return typeof role === 'string' && (
    role === 'Teacher' ||
    role === 'Student' ||
    role === 'Admin'
  );
}

function validateSignupFormat(body: any): body is SignupRequest {
  return body &&
    body.username &&
    body.password &&
    body.email &&
    body.studentID &&
    validateUserRole(body.role) &&
    typeof body.username === 'string' &&
    typeof body.password === 'string' &&
    typeof body.email === 'string' &&
    typeof body.studentID === 'string';
}

export async function authLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
  passport.authenticate(
    'login',
    async (err: any, loginResult: LoginResult | boolean, options: IVerifyOptions | null | undefined) => {
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
          async (error: any) => {
            if (error) {
              return next(error);
            }

            const body: JwtClaims = {
              role: loginResult.role,
              id: loginResult.id,
            };
            const token: string = jwt.sign({ user: body }, jwtSecret);
            res.cookie('jwt', token, {
              //httpOnly: true,
              //secure: true,
              //sameSite: 'none',
              //maxAge: 24 * 60 * 60 * 1000 // one day
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
  if (!validateSignupFormat(req.body)) {
    res.status(400).send({
      success: false,
      error: 'Invalid signup request format',
    });
    return;
  }

  try {
    // TODO signup
    const id: number = await performSignup(req.body.username, req.body.email, req.body.password, req.body.studentID);
    const body: JwtClaims = {
      role: req.body.role,
      id,
    };
    const token: string = jwt.sign({ user: body }, jwtSecret);
    res.cookie('jwt', token, {
      //httpOnly: true,
      //secure: true,
      //sameSite: 'none', //MUOKATTU
      //maxAge: 24 * 60 * 60 * 1000 // one day
    });
    res.send({
      success: true
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
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) => {
      try {
        const role: LoginResult = await validateLogin(username, password);
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
      secretOrKey: jwtSecret,
      jwtFromRequest: (req: Request): string | null => {
        console.log('checking jwt', req.cookies);
        return (req && req.cookies) ? req.cookies['jwt'] : null;
      }
    },
    async (token: { body: JwtClaims }, done: VerifiedCallback): Promise<void> => {
      try {
        return done(null, token.body);
      } catch(e) {
        return done(e);
      }
    }
  )
);
