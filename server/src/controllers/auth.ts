// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HashAlgorithms} from '@otplib/core/';
import * as argon from 'argon2';
import {Request, RequestHandler} from 'express';
import {readFileSync} from 'fs';
import generator from 'generate-password';
import jwt from 'jsonwebtoken';
import {authenticator} from 'otplib';
import passport from 'passport';
import {Strategy as JWTStrategy, VerifiedCallback} from 'passport-jwt';
import {IVerifyOptions, Strategy as LocalStrategy} from 'passport-local';

import {
  AuthData,
  ChangeOwnAuthData,
  ChangeOwnAuthResponse,
  ConfirmMfaData,
  HttpCode,
  LoginData,
  LoginResult,
  PasswordSchema,
  ResetAuthData,
  ResetAuthResult,
  ResetOwnPasswordData,
} from '@/common/types';
import {validateLogin} from './utils/auth';
import {getSamlStrategy} from './utils/saml';
import {findAndValidateUserId, findUserById} from './utils/user';
import {JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS} from '../configs/constants';
import {JWT_SECRET, NODE_ENV, SAML_SP_CERT_FILE} from '../configs/environment';
import httpLogger from '../configs/winston';
import User from '../database/models/user';
import {
  ApiError,
  Endpoint,
  SyncEndpoint,
  JwtClaims,
  LoginCallback,
} from '../types';

// Set TOTP codes to use sha512 instead of sha1
authenticator.options = {algorithm: HashAlgorithms.SHA512, digits: 6};

/**
 * () => AuthData
 *
 * @throws ApiError(404)
 */
export const selfInfo: Endpoint<void, AuthData> = async (req, res) => {
  const user = req.user as JwtClaims;
  const userFromDb = await findUserById(user.id);

  if (userFromDb.name === null) {
    httpLogger.error(`Logged in user ${userFromDb.id} does not have a name`);
    throw new ApiError(
      'Logged in user does not have a name',
      HttpCode.InternalServerError
    );
  }

  res.json({
    id: userFromDb.id,
    role: userFromDb.role,
    name: userFromDb.name,
  });
};

/**
 * (LoginData) => LoginResult
 *
 * @throws ApiError(401)
 */
export const authLogin: SyncEndpoint<LoginData, LoginResult> = (
  req,
  res,
  next
) => {
  const login: LoginCallback = async (error, loginResult) => {
    if (error) return next(error);
    if (!loginResult)
      return res.status(HttpCode.Unauthorized).send({
        errors: ['Incorrect email or password'],
      });

    const user = await User.findByEmail(req.body.email);
    if (user === null) {
      httpLogger.error(
        `User ${req.body.email} not found after validating credentials`
      );
      throw new ApiError(
        'User not found after validating credentials',
        HttpCode.InternalServerError
      );
    }

    // Get mfa secret
    let mfaSecret = user.mfaSecret;
    if (mfaSecret === null) {
      mfaSecret = authenticator.generateSecret(64);
      await user.set({mfaSecret, mfaConfirmed: false}).save();
    }
    const otpAuth = authenticator.keyuri(
      req.body.email,
      'Aalto Grades',
      mfaSecret
    );

    // Force password reset
    if (user.forcePasswordReset) return res.json({status: 'resetPassword'});

    // Show mfa
    if (
      user.mfaSecret === null ||
      (!user.mfaConfirmed && req.body.otp === null)
    ) {
      return res.json({status: 'showMfa', otpAuth});
    }

    // Enter mfa
    if (req.body.otp === null) {
      return res.json({status: 'enterMfa'});
    }

    if (
      NODE_ENV !== 'development' &&
      !authenticator.verify({
        token: req.body.otp,
        secret: user.mfaSecret as string,
      })
    ) {
      return res.status(HttpCode.Unauthorized).send({
        errors: ['Incorrect TOTP token'],
      });
    }

    if (!user.mfaConfirmed) await user.set({mfaConfirmed: true}).save();

    const body: JwtClaims = {id: loginResult.id, role: loginResult.role};
    const token = jwt.sign(body, JWT_SECRET, {expiresIn: JWT_EXPIRY_SECONDS});

    res
      .cookie('jwt', token, {
        httpOnly: true,
        secure: NODE_ENV !== 'test',
        sameSite: 'none',
        maxAge: JWT_COOKIE_EXPIRY_MS,
      })
      .json({
        status: 'ok',
        id: loginResult.id,
        name: loginResult.name,
        role: loginResult.role,
      });
  };

  const authenticate = passport.authenticate('login', login) as RequestHandler;
  authenticate(req, res, next);
};

/** ()=>void */
export const authLogout: SyncEndpoint<void, void> = (_req, res) => {
  res.clearCookie('jwt', {httpOnly: true});
  res.sendStatus(HttpCode.Ok);
};

/**
 * (ResetOwnPasswordData) => void
 *
 * @throws ApiError(401)
 */
export const authResetOwnPassword: SyncEndpoint<ResetOwnPasswordData, void> = (
  req,
  res,
  next
) => {
  const resetOwnPassword: LoginCallback = async (error, loginResult) => {
    if (error) return next(error);
    if (!loginResult)
      return res.status(HttpCode.Unauthorized).send({
        errors: ['Incorrect email or password'],
      });

    const user = await User.findByEmail(req.body.email);
    if (user === null) {
      httpLogger.error(
        `User ${req.body.email} not found after validating credentials`
      );
      throw new ApiError(
        'User not found after validating credentials',
        HttpCode.InternalServerError
      );
    }

    // Password reset / logging in for the first time
    if (user.forcePasswordReset) {
      if (req.body.password === req.body.newPassword) {
        return res.status(HttpCode.BadRequest).send({
          errors: ['New password cannot be the same as the old one'],
        });
      }

      // Validate password strength
      const passwordResult = PasswordSchema.safeParse(req.body.newPassword);
      if (!passwordResult.success) {
        return res.status(HttpCode.BadRequest).send({
          errors: [passwordResult.error.errors[0].message],
        });
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
    }
    res.sendStatus(HttpCode.Ok);
  };

  const authenticate = passport.authenticate(
    'login',
    resetOwnPassword
  ) as RequestHandler;
  authenticate(req, res, next);
};

/**
 * (ResetAuthData) => ResetAuthResult
 *
 * @throws ApiError(400|404)
 */
export const resetAuth: Endpoint<ResetAuthData, ResetAuthResult> = async (
  req,
  res
) => {
  const user = await findAndValidateUserId(req.params.userId);

  let temporaryPassword = null;
  if (req.body.resetPassword) {
    temporaryPassword = generator.generate({
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
  }
  if (req.body.resetMfa) {
    await user.set({mfaSecret: null, mfaConfirmed: false}).save();
  }

  res.json({temporaryPassword});
};

/** (ChangeOwnAuthData) => ChangeOwnAuthResponse */
export const changeOwnAuth: Endpoint<
  ChangeOwnAuthData,
  ChangeOwnAuthResponse
> = async (req, res) => {
  const user = req.user as JwtClaims;

  const dbUser = await User.findByPk(user.id);
  if (dbUser === null) {
    httpLogger.error(`User ${user.id} not found after validating credentials`);
    throw new ApiError(
      'User not found after validating credentials',
      HttpCode.InternalServerError
    );
  }

  if (req.body.resetPassword) {
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
  }

  if (req.body.resetMfa) {
    const mfaSecret = authenticator.generateSecret(64);
    await dbUser.set({mfaSecret, mfaConfirmed: false}).save();
    const otpAuth = authenticator.keyuri(
      dbUser.email as string,
      'Aalto Grades',
      mfaSecret
    );
    return res.json({otpAuth});
  }
  res.json({otpAuth: null});
};

/** (ConfirmMfaData) => void */
export const confirmMfa: Endpoint<ConfirmMfaData, void> = async (req, res) => {
  const user = req.user as JwtClaims;

  const dbUser = await User.findByPk(user.id);
  if (dbUser === null) {
    httpLogger.error(`User ${user.id} not found after validating credentials`);
    throw new ApiError(
      'User not found after validating credentials',
      HttpCode.InternalServerError
    );
  }

  if (
    NODE_ENV !== 'development' &&
    !authenticator.verify({
      token: req.body.otp,
      secret: dbUser.mfaSecret as string,
    })
  ) {
    throw new ApiError('Incorrect TOTP token', HttpCode.Unauthorized);
  }

  await dbUser.set({mfaConfirmed: true}).save();

  res.sendStatus(HttpCode.Ok);
};

/**
 * () => void
 *
 * @throws ApiError(401)
 */
export const authSamlLogin: SyncEndpoint<void, void> = (req, res, next) => {
  const samlLogin: LoginCallback = (error, loginResult) => {
    if (error) return next(error);
    if (!loginResult)
      return res.status(HttpCode.Unauthorized).send({
        errors: ['Authentication failed'],
      });

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
  };

  const authenticate = passport.authenticate(
    'saml',
    samlLogin
  ) as RequestHandler;
  authenticate(req, res, next);
};

/**
 * () => string (application/xml)
 *
 * @throws ApiError(401)
 */
export const samlMetadata: Endpoint<void, string> = async (_req, res) => {
  const cert = readFileSync(SAML_SP_CERT_FILE, 'utf8');
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
        user?: AuthData | false,
        options?: IVerifyOptions
      ) => void
    ) => {
      try {
        const loginResult = await validateLogin(email, password);
        return done(null, loginResult, {message: 'success'});
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
    (token: JwtClaims, done: VerifiedCallback) => done(null, token)
  )
);

/** @throws ApiError(401) */
const useSamlStrategy = async (): Promise<void> => {
  passport.use('saml', await getSamlStrategy());
};

// Cannot use top level await so must call separately...
useSamlStrategy(); // eslint-disable-line @typescript-eslint/no-floating-promises
