// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import * as argon from 'argon2';
import {NextFunction, Request, RequestHandler, Response} from 'express';
import {readFileSync} from 'fs';
import generator from 'generate-password';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {Strategy as JWTStrategy, VerifiedCallback} from 'passport-jwt';
import {IVerifyOptions, Strategy as LocalStrategy} from 'passport-local';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  AuthData,
  ChangePasswordDataSchema,
  HttpCode,
  LoginDataSchema,
  LoginResult,
  PasswordSchema,
  ResetPasswordDataSchema,
  ResetPasswordResponse,
  SystemRole,
} from '@/common/types';
import {getSamlStrategy, validateLogin} from './utils/auth';
import {findAndValidateUserId, findUserById} from './utils/user';
import {JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS} from '../configs/constants';
import {JWT_SECRET, NODE_ENV, SAML_SP_CERT_PATH} from '../configs/environment';
import logger from '../configs/winston';
import User from '../database/models/user';
import {ApiError, FullLoginResult, JwtClaims} from '../types';

/**
 * Responds with AuthData
 *
 * @throws ApiError(404)
 */
export const selfInfo = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtClaims;
  const userFromDb = await findUserById(user.id);

  if (userFromDb.name === null) {
    logger.error(`Logged in user ${userFromDb.id} does not have a name`);
    throw new ApiError(
      'Logged in user does not have a name',
      HttpCode.InternalServerError
    );
  }

  const auth: AuthData = {
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
  req: TypedRequestBody<typeof LoginDataSchema>,
  res: Response,
  next: NextFunction
): void => {
  (
    passport.authenticate(
      'login',
      (error: unknown, loginResult: FullLoginResult | false) => {
        if (error) return next(error);

        if (typeof loginResult === 'boolean') {
          return res.status(HttpCode.Unauthorized).send({
            errors: ['Incorrect email or password'],
          });
        }

        req.login(loginResult, {session: false}, loginError => {
          if (loginError) return next(loginError);

          if (loginResult.forcePasswordReset) {
            return res.json({resetPassword: true});
          }

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

          const result: LoginResult = {
            resetPassword: false,
            id: loginResult.id,
            name: loginResult.name,
            role: loginResult.role,
          };
          return res.json(result);
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
 * Responds with AuthData
 *
 * @throws ApiError(401)
 */
export const authResetOwnPassword = (
  req: TypedRequestBody<typeof ResetPasswordDataSchema>,
  res: Response,
  next: NextFunction
): void => {
  (
    passport.authenticate(
      'login',
      (error: unknown, loginResult: FullLoginResult | false) => {
        if (error) return next(error);

        if (typeof loginResult === 'boolean') {
          return res.status(HttpCode.Unauthorized).send({
            errors: ['Incorrect email or password'],
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        req.login(loginResult, {session: false}, async loginError => {
          if (loginError) return next(loginError);

          // Validate password strength
          const passwordResult = PasswordSchema.safeParse(req.body.newPassword);
          if (!passwordResult.success) {
            return next(passwordResult.error);
          }

          if (req.body.password === req.body.newPassword)
            return res.status(HttpCode.BadRequest).send({
              errors: ['New password cannot be the same as the old one'],
            });

          const user = await User.findByEmail(req.body.email);
          if (user === null) {
            logger.error(
              `User ${req.body.email} not found after validating credentials`
            );
            throw new ApiError(
              'User not found after validating credentials',
              HttpCode.InternalServerError
            );
          }

          // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
          await user
            .set({
              password: await argon.hash(req.body.newPassword, {
                type: argon.argon2id,
                memoryCost: 19456,
                parallelism: 1,
                timeCost: 2,
              }),
              forcePasswordReset: false,
            })
            .save();

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

          const result: AuthData = {
            id: loginResult.id,
            name: loginResult.name,
            role: loginResult.role,
          };
          return res.json(result);
        });
      }
    ) as RequestHandler
  )(req, res, next);
};

/**
 * Responds with ResetPasswordResponse
 *
 * @throws ApiError(400|404)
 */
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<Response | void> => {
  const user = await findAndValidateUserId(req.params.userId);

  const temporaryPassword = generator.generate({
    length: 16,
    numbers: true,
  });

  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  await user
    .set({
      password: await argon.hash(temporaryPassword, {
        type: argon.argon2id,
        memoryCost: 19456,
        parallelism: 1,
        timeCost: 2,
      }),
      forcePasswordReset: true,
    })
    .save();

  const resData: ResetPasswordResponse = {temporaryPassword};
  res.json(resData);
};

export const changePassword = async (
  req: TypedRequestBody<typeof ChangePasswordDataSchema>,
  res: Response
): Promise<Response | void> => {
  const user = req.user as JwtClaims;

  const dbUser = await User.findByPk(user.id);
  if (dbUser === null) {
    logger.error(`User ${user.id} not found after validating credentials`);
    throw new ApiError(
      'User not found after validating credentials',
      HttpCode.InternalServerError
    );
  }

  // https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
  await dbUser
    .set({
      password: await argon.hash(req.body.newPassword, {
        type: argon.argon2id,
        memoryCost: 19456,
        parallelism: 1,
        timeCost: 2,
      }),
    })
    .save();

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
      (error: Error | null, loginResult: FullLoginResult | undefined) => {
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
        user?: FullLoginResult | false,
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
