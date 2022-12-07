import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { IVerifyOptions } from 'passport-local';
import { UserRole, PlainPassword } from '../services/auth';
import { app } from '.';
import { jwtSecret } from '../configs';

interface LoginRequest {
  username: string,
  password: PlainPassword,
}
interface SignupRequest {
  username: string,
  password: PlainPassword,
  email: string,
  role: UserRole,
}

function validateUserRole(role: any): role is UserRole {
  return typeof role === 'string' && (
    role === 'Teacher' ||
    role === 'Student' ||
    role === 'Admin'
  );
}

function validateLoginFormat(body: any): body is LoginRequest {
  return body &&
    body.username &&
    body.password &&
    typeof body.username === 'string' &&
    typeof body.password === 'string';
}

function validateSignupFormat(body: any): body is SignupRequest {
  return body &&
    body.username &&
    body.password &&
    body.email &&
    validateUserRole(body.role) &&
    typeof body.username === 'string' &&
    typeof body.password === 'string' &&
    typeof body.email === 'string';
}

app.post('/v1/auth/login', express.json(), async (req: Request, res: Response, next) => {
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
});

app.post('/v1/auth/signup', express.json(), async (req: Request, res: Response) => {
  if (!validateSignupFormat(req.body)) {
    res.status(400); 
    return res.send({
      success: false,
      error: 'Invalid signup request format',
    });
  }

  try {
    // TODO signup
    //await performSignup(req.body.username, req.body.email, req.body.password, req.body.role);
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
});
