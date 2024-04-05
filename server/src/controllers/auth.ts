// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import argon from 'argon2';
import {NextFunction, Request, Response} from 'express';
import {ParamsDictionary, RequestHandler} from 'express-serve-static-core';
import {readFileSync} from 'fs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {Strategy as JWTStrategy, VerifiedCallback} from 'passport-jwt';
import {IVerifyOptions, Strategy as LocalStrategy} from 'passport-local';

import {HttpCode, LoginResult, SignupRequest, SystemRole} from '@common/types';
import {JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS} from '../configs/constants';
import {JWT_SECRET, NODE_ENV, SAML_SP_CERT_PATH} from '../configs/environment';
import User from '../database/models/user';
import {ApiError, JwtClaims} from '../types';
import {getSamlStrategy, validateLogin} from './utils/auth';
import {findUserById} from './utils/user';

/**
 * Responds with LoginResult
 */
export const authSelfInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = req.user as JwtClaims;
  const userFromDb = await findUserById(user.id);

  const auth: LoginResult = {
    id: userFromDb.id,
    role: userFromDb.role as SystemRole,
    name: userFromDb.name,
  };

  res.json(auth);
};

/**
 * Responds with LoginResult
 */
export const authLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  (
    passport.authenticate(
      'login',
      (error: unknown, loginResult: LoginResult | boolean) => {
        if (error) return next(error);

        if (typeof loginResult === 'boolean') {
          return res.status(HttpCode.Unauthorized).send({
            success: false,
            errors: ['incorrect email or password'],
          });
        }

        req.login(loginResult, {session: false}, (loginError: unknown) => {
          if (loginError) return next(loginError);

          const body: JwtClaims = {
            id: loginResult.id,
            role: loginResult.role,
          };

          const token = jwt.sign(body, JWT_SECRET, {
            expiresIn: JWT_EXPIRY_SECONDS,
          });

          res.cookie('jwt', token, {
            httpOnly: true,
            secure: NODE_ENV !== 'test',
            sameSite: 'none',
            maxAge: JWT_COOKIE_EXPIRY_MS,
          });

          return res.json(loginResult);
        });
      }
    ) as RequestHandler
  )(req, res, next);
};

export const authLogout = (_req: Request, res: Response): void => {
  res.clearCookie('jwt', {httpOnly: true});
  res.sendStatus(HttpCode.Ok);
};

/**
 * Responds with LoginResult
 */
export const authSignup = async (
  req: Request<ParamsDictionary, unknown, SignupRequest>,
  res: Response
): Promise<void> => {
  const exists = await User.findByEmail(req.body.email);

  if (exists) {
    throw new ApiError(
      'user account with the specified email already exists',
      HttpCode.Conflict
    );
  }

  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: await argon.hash(req.body.password.trim()),
    studentNumber: req.body.studentNumber,
    role: req.body.role ?? SystemRole.User,
  });

  const body: JwtClaims = {role: newUser.role as SystemRole, id: newUser.id};

  const token = jwt.sign(body, JWT_SECRET, {expiresIn: JWT_EXPIRY_SECONDS});

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: NODE_ENV !== 'test',
    sameSite: 'none',
    maxAge: JWT_COOKIE_EXPIRY_MS,
  });

  const auth: LoginResult = {
    id: newUser.id,
    role: newUser.role as SystemRole,
    name: newUser.name,
  };

  res.json(auth);
};

export const authSamlLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  (
    passport.authenticate(
      'saml',
      (error: Error | null, loginResult: LoginResult | undefined) => {
        if (error) return next(error);

        if (loginResult === undefined) {
          return res.status(HttpCode.Unauthorized).send({
            success: false,
            errors: ['Authentication failed'],
          });
        }

        req.login(loginResult, {session: false}, (loginError: unknown) => {
          if (loginError) return next(loginError);

          const body: JwtClaims = {id: loginResult.id, role: loginResult.role};

          const token = jwt.sign(body, JWT_SECRET, {
            expiresIn: JWT_EXPIRY_SECONDS,
          });

          res.cookie('jwt', token, {
            httpOnly: true,
            secure: NODE_ENV !== 'test',
            sameSite: 'none',
            maxAge: JWT_COOKIE_EXPIRY_MS,
          });

          return res.redirect('/');
        });
      }
    ) as RequestHandler
  )(req, res, next);
};

/**
 * Responds with application/xml
 */
export const samlMetadata = async (
  req: Request,
  res: Response
): Promise<void> => {
  const cert = readFileSync(SAML_SP_CERT_PATH, 'utf8');
  res
    .type('application/xml')
    .send(
      (await getSamlStrategy()).generateServiceProviderMetadata(cert, cert)
    );
};

passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async (
      email: string,
      password: string,
      done: (
        error: unknown,
        user?: LoginResult | false,
        options?: IVerifyOptions
      ) => void
    ) => {
      try {
        const role = await validateLogin(email, password);
        return done(null, role, {message: 'success'});
      } catch (error) {
        if (error instanceof ApiError) {
          return done(null, false, {message: error.message});
        }
        return done(error);
      }
    }
  )
);

passport.use(
  'jwt',
  new JWTStrategy(
    {
      secretOrKey: JWT_SECRET,
      jwtFromRequest: (req: Request): string | null =>
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        req && req.cookies ? (req.cookies.jwt as string) : null,
    },
    (token: JwtClaims, done: VerifiedCallback) => {
      try {
        return done(null, token);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

const useSamlStrategy = async (): Promise<void> => {
  passport.use('saml', await getSamlStrategy());
};

useSamlStrategy(); // eslint-disable-line @typescript-eslint/no-floating-promises
