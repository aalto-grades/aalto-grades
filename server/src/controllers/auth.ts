// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import * as argon from 'argon2';
import type {Request, RequestHandler, Response} from 'express';
import generator from 'generate-password';
import jwt from 'jsonwebtoken';
import {readFileSync} from 'node:fs';
import {generateSecret, generateURI, verify} from 'otplib';
import passport from 'passport';
import {Strategy as JWTStrategy, type VerifiedCallback} from 'passport-jwt';
import {type IVerifyOptions, Strategy as LocalStrategy} from 'passport-local';

import {
  type AuthData,
  type ChangeOwnAuthData,
  type ChangeOwnAuthResponse,
  type ConfirmMfaData,
  HttpCode,
  type LoginData,
  type LoginResult,
  type PasskeyDeleteOwnData,
  type PasskeyListOwnResult,
  type PasskeyLoginFinishData,
  type PasskeyLoginFinishResult,
  type PasskeyLoginStartData,
  type PasskeyLoginStartResult,
  type PasskeyRegisterFinishData,
  type PasskeyRegisterFinishResult,
  type PasskeyRegisterStartData,
  type PasskeyRegisterStartResult,
  PasswordSchema,
  type ResetAuthData,
  type ResetAuthResult,
  type ResetOwnPasswordData,
  SystemRole,
} from '@/common/types';
import {validateLogin} from './utils/auth';
import {getSamlStrategy} from './utils/saml';
import {findAndValidateUserId, findUserById} from './utils/user';
import {JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS} from '../configs/constants';
import {
  JWT_SECRET,
  NODE_ENV,
  SAML_SP_CERT_FILE,
  WEBAUTHN_ORIGIN,
  WEBAUTHN_RP_ID,
  WEBAUTHN_RP_NAME,
} from '../configs/environment';
import httpLogger from '../configs/winston';
import Passkey from '../database/models/passkey';
import User from '../database/models/user';
import {
  ApiError,
  type Endpoint,
  type JwtClaims,
  type LoginCallback,
  type SyncEndpoint,
} from '../types';

type RegistrationResponse = Parameters<typeof verifyRegistrationResponse>[0]['response'];
type AuthenticationResponse = Parameters<
  typeof verifyAuthenticationResponse
>[0]['response'];

const toUint8Array = (base64url: string): ReturnType<Uint8Array['slice']> =>
  new Uint8Array(Buffer.from(base64url, 'base64url'));

const setJwtCookie = (res: Response, loginResult: AuthData): void => {
  const body: JwtClaims = {id: loginResult.id, role: loginResult.role};
  const token = jwt.sign(body, JWT_SECRET, {expiresIn: JWT_EXPIRY_SECONDS});

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: NODE_ENV !== 'test',
    sameSite: 'none',
    maxAge: JWT_COOKIE_EXPIRY_MS,
  });
};

const sendLoginSuccess = (res: Response, loginResult: AuthData): void => {
  setJwtCookie(res, loginResult);
  res
    .json({
      status: 'ok',
      id: loginResult.id,
      name: loginResult.name,
      email: loginResult.email,
      role: loginResult.role,
    });
};

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

  if (userFromDb.email === null) {
    httpLogger.error(`Logged in user ${userFromDb.id} does not have an email`);
    throw new ApiError(
      'Logged in user does not have an email',
      HttpCode.InternalServerError
    );
  }

  res.json({
    id: userFromDb.id,
    role: user.role,
    email: userFromDb.email,
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

    // Get MFA secret
    let mfaSecret = user.mfaSecret;
    if (mfaSecret === null) {
      mfaSecret = generateSecret({length: 64});
      await user.set({mfaSecret, mfaConfirmed: false}).save();
    }
    const otpAuth = generateURI({
      label: req.body.email,
      issuer: 'Ossi',
      secret: mfaSecret
    });

    // Force password reset
    if (user.forcePasswordReset) return res.json({status: 'resetPassword'});

    // Show MFA
    if (
      user.mfaSecret === null
      || (!user.mfaConfirmed && req.body.otp === null)
    ) {
      return res.json({status: 'showMfa', otpAuth});
    }

    // Enter MFA
    if (req.body.otp === null) {
      return res.json({status: 'enterMfa'});
    }

    if (
      NODE_ENV !== 'development'
      && await verify({
        token: req.body.otp,
        secret: user.mfaSecret as string,
      })
    ) {
      return res.status(HttpCode.Unauthorized).send({
        errors: ['Incorrect TOTP code'],
      });
    }

    if (!user.mfaConfirmed) await user.set({mfaConfirmed: true}).save();

    sendLoginSuccess(res, loginResult);
  };

  const authenticate = passport.authenticate('login', login) as RequestHandler;
  authenticate(req, res, next);
};

/** () => void */
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
          errors: [passwordResult.error.issues[0].message],
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
    const mfaSecret = generateSecret({length: 64});
    await dbUser.set({mfaSecret, mfaConfirmed: false}).save();
    const otpAuth = generateURI({
      label: dbUser.email as string,
      issuer: 'Ossi',
      secret: mfaSecret
    });
    return res.json({otpAuth});
  }
  res.json({otpAuth: null});
};

/** ({}) => PasskeyRegisterStartResult */
export const passkeyRegisterStart: Endpoint<
  PasskeyRegisterStartData,
  PasskeyRegisterStartResult
> = async (req, res) => {
  const user = req.user as JwtClaims;

  const dbUser = await User.findByPk(user.id);
  if (dbUser === null) {
    throw new ApiError(
      'User not found after validating credentials',
      HttpCode.InternalServerError
    );
  }

  if (dbUser.email === null || dbUser.name === null) {
    throw new ApiError(
      'User not found after validating credentials',
      HttpCode.InternalServerError
    );
  }

  const existingPasskeys = await Passkey.findAll({
    where: {userId: dbUser.id},
    attributes: ['credentialId'],
  });

  const options = await generateRegistrationOptions({
    rpName: WEBAUTHN_RP_NAME,
    rpID: WEBAUTHN_RP_ID,
    userID: new TextEncoder().encode(dbUser.id.toString()),
    userName: dbUser.email,
    userDisplayName: dbUser.name,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    excludeCredentials: existingPasskeys.map(passkey => ({
      id: passkey.credentialId,
    })),
  });

  await dbUser.set({passkeyChallenge: options.challenge}).save();
  res.json({options});
};

/** (PasskeyRegisterFinishData) => PasskeyRegisterFinishResult */
export const passkeyRegisterFinish: Endpoint<
  PasskeyRegisterFinishData,
  PasskeyRegisterFinishResult
> = async (req, res) => {
  const user = req.user as JwtClaims;

  const dbUser = await User.findByPk(user.id);
  if (dbUser === null) {
    throw new ApiError('Passkey registration not initialized', HttpCode.BadRequest);
  }

  if (dbUser.passkeyChallenge === null) {
    throw new ApiError('Passkey registration not initialized', HttpCode.BadRequest);
  }

  let verified: boolean;
  let credentialId: string | null = null;
  let publicKey: string | null = null;
  let counter: number | null = null;
  let aaguid: string | null = null;
  let credentialDeviceType: string | null = null;
  let credentialBackedUp: boolean | null = null;

  const registrationResponse = req.body.registrationResponse as RegistrationResponse;

  try {
    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: dbUser.passkeyChallenge,
      expectedOrigin: WEBAUTHN_ORIGIN,
      expectedRPID: WEBAUTHN_RP_ID,
      requireUserVerification: false,
    });

    verified = verification.verified;
    if (verification.registrationInfo) {
      credentialId = verification.registrationInfo.credential.id;
      publicKey = Buffer.from(
        verification.registrationInfo.credential.publicKey
      ).toString('base64url');
      counter = verification.registrationInfo.credential.counter;
      aaguid = verification.registrationInfo.aaguid;
      credentialDeviceType = verification.registrationInfo.credentialDeviceType;
      credentialBackedUp = verification.registrationInfo.credentialBackedUp;
    }
  } catch {
    throw new ApiError('Invalid passkey registration response', HttpCode.Unauthorized);
  }

  if (
    !verified
    || credentialId === null
    || publicKey === null
    || counter === null
    || aaguid === null
    || credentialDeviceType === null
    || credentialBackedUp === null
  ) {
    throw new ApiError('Passkey registration failed', HttpCode.Unauthorized);
  }

  const authenticatorAttachment = registrationResponse.authenticatorAttachment ?? null;
  const transports = registrationResponse.response.transports ?? [];

  await Passkey.upsert({
    userId: dbUser.id,
    credentialId,
    publicKey,
    counter,
    authenticatorAttachment,
    transports,
    aaguid,
    credentialDeviceType,
    credentialBackedUp,
  });
  await dbUser.set({passkeyChallenge: null}).save();

  res.json({ok: true});
};

/** (PasskeyLoginStartData) => PasskeyLoginStartResult */
export const passkeyLoginStart: Endpoint<
  PasskeyLoginStartData,
  PasskeyLoginStartResult
> = async (req, res) => {
  const user = await User.findByEmail(req.body.email);
  if (!user?.admin) {
    throw new ApiError('Incorrect email or passkey', HttpCode.Unauthorized);
  }

  const passkeys = await Passkey.findAll({
    where: {userId: user.id},
    attributes: ['credentialId'],
  });

  if (passkeys.length === 0) {
    throw new ApiError('Incorrect email or passkey', HttpCode.Unauthorized);
  }

  const options = await generateAuthenticationOptions({
    rpID: WEBAUTHN_RP_ID,
    userVerification: 'preferred',
    allowCredentials: passkeys.map(passkey => ({id: passkey.credentialId})),
  });

  await user.set({passkeyChallenge: options.challenge}).save();
  res.json({options});
};

/** (PasskeyLoginFinishData) => PasskeyLoginFinishResult */
export const passkeyLoginFinish: Endpoint<
  PasskeyLoginFinishData,
  PasskeyLoginFinishResult
> = async (req, res) => {
  const user = await User.findByEmail(req.body.email);
  if (
    user === null
    || !user.admin
    || user.name === null
    || user.email === null
    || user.passkeyChallenge === null
  ) {
    throw new ApiError('Incorrect email or passkey', HttpCode.Unauthorized);
  }

  const authenticationResponse = req.body
    .authenticationResponse as AuthenticationResponse;
  const passkey = await Passkey.findOne({
    where: {
      userId: user.id,
      credentialId: authenticationResponse.id,
    },
  });
  if (passkey === null) {
    throw new ApiError('Incorrect email or passkey', HttpCode.Unauthorized);
  }

  let verified: boolean;
  let newCounter: number;

  try {
    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge: user.passkeyChallenge,
      expectedOrigin: WEBAUTHN_ORIGIN,
      expectedRPID: WEBAUTHN_RP_ID,
      credential: {
        id: passkey.credentialId,
        publicKey: toUint8Array(passkey.publicKey),
        counter: passkey.counter,
      },
      requireUserVerification: false,
    });

    verified = verification.verified;
    newCounter = verification.authenticationInfo.newCounter;
  } catch {
    throw new ApiError('Invalid passkey authentication response', HttpCode.Unauthorized);
  }

  if (!verified) {
    throw new ApiError('Incorrect email or passkey', HttpCode.Unauthorized);
  }

  await passkey.set({counter: newCounter}).save();
  await user.set({passkeyChallenge: null}).save();

  const authResult = {
    id: user.id,
    role: SystemRole.Admin,
    email: user.email,
    name: user.name,
  };

  setJwtCookie(res, authResult);
  res.json(authResult);
};

/** ({}) => PasskeyListOwnResult */
export const passkeyListOwn: Endpoint<
  Record<string, never>,
  PasskeyListOwnResult
> = async (req, res) => {
  const user = req.user as JwtClaims;
  const passkeys = await Passkey.findAll({
    where: {userId: user.id},
    order: [['createdAt', 'ASC']],
  });

  res.json({
    passkeys: passkeys.map(passkey => ({
      id: passkey.id,
      credentialId: passkey.credentialId,
      authenticatorAttachment: passkey.authenticatorAttachment,
      transports: passkey.transports ?? [],
      aaguid: passkey.aaguid,
      credentialDeviceType: passkey.credentialDeviceType,
      credentialBackedUp: passkey.credentialBackedUp,
      createdAt: passkey.createdAt.toISOString(),
      updatedAt: passkey.updatedAt.toISOString(),
    })),
  });
};

/** (PasskeyDeleteOwnData) => void */
export const passkeyDeleteOwn: Endpoint<PasskeyDeleteOwnData, void> = async (
  req,
  res
) => {
  const user = req.user as JwtClaims;
  const passkey = await Passkey.findOne({
    where: {id: req.body.passkeyId, userId: user.id},
  });
  if (passkey === null) {
    throw new ApiError('Passkey not found', HttpCode.NotFound);
  }

  await passkey.destroy();
  res.sendStatus(HttpCode.Ok);
};

/**
 * (ConfirmMfaData) => void
 *
 * @throws ApiError(401)
 */
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
    NODE_ENV !== 'development'
    && await verify({
      token: req.body.otp,
      secret: dbUser.mfaSecret as string,
    })
  ) {
    throw new ApiError('Incorrect TOTP code', HttpCode.Unauthorized);
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
  // Type assertion needed due to Express type incompatibility in @node-saml/passport-saml, maybe update fixes it
  passport.use('saml', (await getSamlStrategy()) as unknown as passport.Strategy);
};

// Cannot use top level await so must call separately...
useSamlStrategy();
