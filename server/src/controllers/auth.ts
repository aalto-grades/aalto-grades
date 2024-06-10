// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {NextFunction, Request, RequestHandler, Response} from 'express';
import {readFileSync} from 'fs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {Strategy as JWTStrategy, VerifiedCallback} from 'passport-jwt';
import {IVerifyOptions, Strategy as LocalStrategy} from 'passport-local';

import {HttpCode, LoginResult, SystemRole} from '@/common/types';
import {getSamlStrategy, validateLogin} from './utils/auth';
import {findUserById} from './utils/user';
import {JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS} from '../configs/constants';
import {JWT_SECRET, NODE_ENV, SAML_SP_CERT_PATH} from '../configs/environment';
import httpLogger from '../configs/winston';
import {ApiError, JwtClaims} from '../types';

/**
 * Responds with LoginResult
 *
 * @throws ApiError(404)
 */
export const authSelfInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = req.user as JwtClaims;
  const userFromDb = await findUserById(user.id);

  if (userFromDb.name === null) {
    httpLogger.error(`Logged in user ${userFromDb.id} does not have a name`);
    throw new ApiError(
      'Logged in user does not have a name',
      HttpCode.InternalServerError
    );
  }

  const auth: LoginResult = {
    id: userFromDb.id,
    role: userFromDb.role as SystemRole,
    name: userFromDb.name,
  };

  res.json(auth);
};

/**
 * Responds with LoginResult
 *
 * @throws ApiError(401)
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

/** @throws ApiError(401) */
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
 *
 * @throws ApiError(401)
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

/** @throws ApiError(401) */
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
        req?.cookies ? (req.cookies.jwt as string) : null,
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

/** @throws ApiError(401) */
const useSamlStrategy = async (): Promise<void> => {
  passport.use('saml', await getSamlStrategy());
};

useSamlStrategy(); // eslint-disable-line @typescript-eslint/no-floating-promises
