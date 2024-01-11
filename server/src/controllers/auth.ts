// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  HttpCode,
  LoginResult,
  PlainPassword,
  SignupRequest,
  SystemRole,
} from 'aalto-grades-common/types';
import argon from 'argon2';
import {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {
  Profile,
  Strategy as SamlStrategy,
  VerifiedCallback as SamlVerifiedCallback,
} from '@node-saml/passport-saml';
import {Strategy as JWTStrategy, VerifiedCallback} from 'passport-jwt';
import {IVerifyOptions, Strategy as LocalStrategy} from 'passport-local';
import * as yup from 'yup';
import {readFileSync} from 'fs';

import {JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS} from '../configs/constants';
import {
  JWT_SECRET,
  NODE_ENV,
  SAML_CALLBACK,
  SAML_ENCRYPT_PVK,
  SAML_ENTITY,
  SAML_ENTRYPOINT,
  SAML_IDP_CERT,
  SAML_PRIVATE_KEY,
  SAML_SP_CERT_PATH,
  SAML_METADATA_URL,
} from '../configs/environment';

import User from '../database/models/user';

import {ApiError, JwtClaims} from '../types';
import {findUserById} from './utils/user';
import {getIdpSignCert} from './utils/saml';

export async function authSelfInfo(req: Request, res: Response): Promise<void> {
  const user: JwtClaims = req.user as JwtClaims;

  const userFromDb: User = await findUserById(user.id, HttpCode.NotFound);

  const auth: LoginResult = {
    id: userFromDb.id,
    role: userFromDb.role as SystemRole,
    name: userFromDb.name,
  };

  res.send({
    data: auth,
  });
}

export async function validateLogin(
  email: string,
  password: PlainPassword
): Promise<LoginResult> {
  const user: User | null = await User.findByEmail(email);

  if (user === null) {
    throw new ApiError('invalid credentials', HttpCode.Unauthorized);
  }

  const match: boolean = await argon.verify(user.password.trim(), password);

  if (!match) {
    throw new ApiError('invalid credentials', HttpCode.Unauthorized);
  }

  return {
    id: user.id,
    role: user.role as SystemRole,
    name: user.name ?? '-',
  };
}

export async function authLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  passport.authenticate(
    'login',
    async (error: unknown, loginResult: LoginResult | boolean) => {
      if (error) {
        return next(error);
      }
      if (typeof loginResult === 'boolean') {
        return res.status(HttpCode.Unauthorized).send({
          success: false,
          errors: ['incorrect email or password'],
        });
      }

      req.login(loginResult, {session: false}, async (error: unknown) => {
        if (error) {
          return next(error);
        }

        const body: JwtClaims = {
          id: loginResult.id,
          role: loginResult.role,
        };

        const token: string = jwt.sign(body, JWT_SECRET, {
          expiresIn: JWT_EXPIRY_SECONDS,
        });

        res.cookie('jwt', token, {
          httpOnly: true,
          secure: NODE_ENV !== 'test',
          sameSite: 'none',
          maxAge: JWT_COOKIE_EXPIRY_MS,
        });

        return res.send({
          data: loginResult,
        });
      });
    }
  )(req, res, next);
}

export async function authLogout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('jwt', {
    httpOnly: true,
  });

  res.send({
    data: {},
  });
}

export async function authSignup(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    name: yup.string().required(),
    password: yup.string().required(),
    email: yup.string().email().required(),
    studentID: yup.string().notRequired(),
    role: yup
      .string()
      .transform((value: string, originalValue: string) => {
        return originalValue ? originalValue.toUpperCase() : value;
      })
      .oneOf(Object.values(SystemRole))
      .notRequired(),
  });

  const request: SignupRequest = await requestSchema.validate(req.body, {
    abortEarly: false,
  });

  const exists: User | null = await User.findByEmail(request.email);

  if (exists) {
    throw new ApiError(
      'user account with the specified email already exists',
      HttpCode.Conflict
    );
  }

  const newUser: User = await User.create({
    name: request.name,
    email: request.email,
    password: await argon.hash(request.password.trim()),
    studentNumber: request.studentNumber,
    role: request.role ?? SystemRole.User,
  });

  const body: JwtClaims = {
    role: newUser.role as SystemRole,
    id: newUser.id,
  };

  const token: string = jwt.sign(body, JWT_SECRET, {
    expiresIn: JWT_EXPIRY_SECONDS,
  });

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

  res.send({
    data: auth,
  });
}

export async function authSamlLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  passport.authenticate(
    'saml',
    async (error: Error | null, loginResult: LoginResult | undefined) => {
      if (error) {
        return next(error);
      }
      if (loginResult === undefined) {
        return res.status(HttpCode.Unauthorized).send({
          success: false,
          errors: ['Authentication failed'],
        });
      }

      req.login(loginResult, {session: false}, async (error: unknown) => {
        if (error) {
          return next(error);
        }

        const body: JwtClaims = {
          id: loginResult.id,
          role: loginResult.role,
        };

        const token: string = jwt.sign(body, JWT_SECRET, {
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
  )(req, res, next);
}

// should be put to a seperate file
async function getSamlStrategy(): Promise<SamlStrategy> {
  return new SamlStrategy(
    {
      callbackUrl: SAML_CALLBACK,
      entryPoint: SAML_ENTRYPOINT,
      issuer: SAML_ENTITY,
      cert: (await getIdpSignCert(SAML_METADATA_URL)) || SAML_IDP_CERT, //IdP public key in .pem format
      decryptionPvk: SAML_ENCRYPT_PVK,
      privateKey: SAML_PRIVATE_KEY, //SP private key in .pem format
      signatureAlgorithm: 'sha256',
      identifierFormat: null,
      passReqToCallback: true, // This is required when using typescript apparently...
    },
    async (
      _req: Request,
      profile: Profile | null,
      done: SamlVerifiedCallback
    ) => {
      // for signon
      try {
        const eduUser = profile?.['urn:oid:1.3.6.1.4.1.5923.1.1.1.6'] as string;
        const email = profile?.['urn:oid:0.9.2342.19200300.100.1.3'] as string;
        const name = profile?.['urn:oid:2.16.840.1.113730.3.1.241'] as string;
        if (!email)
          throw new ApiError('No email in assertion', HttpCode.Unauthorized);
        const user: User | null = await User.findIdpUserByEmail(email);
        if (!user) {
          throw new ApiError(
            'User not authorized, please ask admin for permissions',
            HttpCode.Unauthorized
          );
        }
        if (!user.eduUser) {
          user.update({
            eduUser: eduUser,
          });
        }
        // for now if teacher email is added by admin we allow the teacher to signin
        return done(null, {
          id: user.id,
          role: user.role as SystemRole,
          name: user.name ?? name ?? '-',
        });
      } catch (err: unknown) {
        return done(err as Error);
      }
    },
    (_req: Request, profile: Profile | null, done: SamlVerifiedCallback) => {
      // for logout
      try {
        return done(null, {profile});
      } catch (err: unknown) {
        return done(err as Error);
      }
    }
  );
}

export async function samlMetadata(req: Request, res: Response): Promise<void> {
  res.type('application/xml');
  res.status(200);
  const cert = readFileSync(SAML_SP_CERT_PATH, 'utf8');
  res.send(
    (await getSamlStrategy()).generateServiceProviderMetadata(cert, cert)
  );
}

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
        error: unknown | null,
        user?: LoginResult | false,
        options?: IVerifyOptions
      ) => void
    ) => {
      try {
        const role: LoginResult = await validateLogin(email, password);
        return done(null, role, {message: 'success'});
      } catch (error: unknown) {
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
      jwtFromRequest: (req: Request): string | null => {
        return req && req.cookies ? req.cookies['jwt'] : null;
      },
    },
    async (token: JwtClaims, done: VerifiedCallback): Promise<void> => {
      try {
        return done(null, token);
      } catch (error: unknown) {
        return done(error, false);
      }
    }
  )
);

async function useSamlStrategy(): Promise<void> {
  passport.use('saml', await getSamlStrategy());
}

useSamlStrategy();
