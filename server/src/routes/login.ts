// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';
import { UserRole, PlainPassword, validateLogin, InvalidCredentials, performSignup } from '../controllers/auth';
import { Strategy as LocalStrategy } from 'passport-local';
import { jwtSecret } from '../configs';

interface SignupRequest {
  username: string,
  password: PlainPassword,
  email: string,
  studentId: string,
  role: UserRole,
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

export async function authLogin(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    'login',
    async (err, role: UserRole | boolean, options: IVerifyOptions | null | undefined) => {
      try {
        if (err) {
          return next(err);
        }
        if (role == false || role == true) {
          res.status(401);
          return res.send({
            success: false,
            message: options ? options.message : 'unknown error',
          });
        }

        req.login(
          role,
          { session: false },
          async (error) => {
            if (error) {
              return next(error);
            }

            const body = {
              role,
            };
            const token = jwt.sign({ user: body }, jwtSecret);
            res.cookie('jwt', token, {
              httpOnly: true,
              secure: true,
              sameSite: true,
              maxAge: 24 * 60 * 60 * 1000 // one day
            });
            return res.send({
              success: true,
              role
            });
          }
        );
      } catch (error) {
        return next(error);
      }
    }
  )(req, res, next);
}

export async function authSignup(req: Request, res: Response) {
  if (!validateSignupFormat(req.body)) {
    res.status(400); 
    return res.send({
      success: false,
      error: 'Invalid signup request format',
    });
  }

  try {
    // TODO signup
    await performSignup(req.body.username, req.body.email, req.body.password, req.body.studentId);
    const body = {
      role: req.body.role,
    };
    const token = jwt.sign({ user: body }, jwtSecret);
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: true,
      sameSite: true,
      maxAge: 24 * 60 * 60 * 1000 // one day
    });
    res.send({
      success: true
    });
  } catch (error) {
    // 403 or 400 or 500? The Promise architecture with appropriate rejections should
    // carry this info
    res.status(400);
    return res.send({
      success: false,
      error: error,
    });
  }
}

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password'
    },
    async (username, password, done) => {
      try {
        const role = await validateLogin(username, password);
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
