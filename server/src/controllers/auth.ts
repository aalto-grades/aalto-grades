// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  Profile,
  Strategy as SamlStrategy,
  VerifiedCallback as SamlVerifiedCallback,
} from '@node-saml/passport-saml';
import argon from 'argon2';
import {NextFunction, Request, Response} from 'express';
import {ParamsDictionary, RequestHandler} from 'express-serve-static-core';
import {readFileSync} from 'fs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import {Strategy as JWTStrategy, VerifiedCallback} from 'passport-jwt';
import {IVerifyOptions, Strategy as LocalStrategy} from 'passport-local';
import {z} from 'zod';

import {HttpCode, LoginResult, PlainPassword, SystemRole} from '@common/types';
import {JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS} from '../configs/constants';
import {
  JWT_SECRET,
  NODE_ENV,
  SAML_CALLBACK,
  SAML_ENCRYPT_PVK,
  SAML_ENTITY,
  SAML_ENTRYPOINT,
  SAML_IDP_CERT,
  SAML_METADATA_URL,
  SAML_PRIVATE_KEY,
  SAML_SP_CERT_PATH,
} from '../configs/environment';
import User from '../database/models/user';
import {ApiError, JwtClaims} from '../types';
import {getIdpSignCert} from './utils/saml';
import {findUserById} from './utils/user';

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

  res.send({data: auth});
};

export const validateLogin = async (
  email: string,
  password: PlainPassword
): Promise<LoginResult> => {
  const user = await User.findByEmail(email);

  if (user === null) {
    throw new ApiError('invalid credentials', HttpCode.Unauthorized);
  }

  const match = await argon.verify(user.password.trim(), password);

  if (!match) {
    throw new ApiError('invalid credentials', HttpCode.Unauthorized);
  }

  return {
    id: user.id,
    role: user.role as SystemRole,
    name: user.name,
  };
};

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

          return res.send({data: loginResult});
        });
      }
    ) as RequestHandler
  )(req, res, next);
};

export const authLogout = (_req: Request, res: Response): void => {
  res.clearCookie('jwt', {httpOnly: true});

  res.send({data: {}});
};

export const authSignupBodySchema = z.object({
  name: z.string(),
  password: z.string(),
  email: z.string().email(),
  studentNumber: z.string().optional(),
  role: z.nativeEnum(SystemRole).optional(),
});
type AuthSignupBody = z.infer<typeof authSignupBodySchema>;

export const authSignup = async (
  req: Request<ParamsDictionary, unknown, AuthSignupBody>,
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

  res.send({data: auth});
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
    ) as RequestHandler
  )(req, res, next);
};

// should be put to a seperate file
const getSamlStrategy = async (): Promise<SamlStrategy> =>
  new SamlStrategy(
    {
      callbackUrl: SAML_CALLBACK,
      entryPoint: SAML_ENTRYPOINT,
      issuer: SAML_ENTITY,
      cert: (await getIdpSignCert(SAML_METADATA_URL)) || SAML_IDP_CERT, // IdP public key in .pem format
      decryptionPvk: SAML_ENCRYPT_PVK,
      privateKey: SAML_PRIVATE_KEY, // SP private key in .pem format
      signatureAlgorithm: 'sha256',
      identifierFormat: null,
      passReqToCallback: true, // This is required when using typescript apparently...
    },
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
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

        const user = await User.findIdpUserByEmail(email);
        if (!user) {
          throw new ApiError(
            'User not authorized, please ask admin for permissions',
            HttpCode.Unauthorized
          );
        }
        if (!user.eduUser) await user.update({eduUser: eduUser});
        if (!user.name) await user.update({name: name});

        // for now if teacher email is added by admin we allow the teacher to signin
        return done(null, {
          id: user.id,
          role: user.role as SystemRole,
          name: user.name,
        });
      } catch (err) {
        return done(err as Error);
      }
    },
    (_req: Request, profile: Profile | null, done: SamlVerifiedCallback) => {
      // for logout
      try {
        return done(null, {profile});
      } catch (err) {
        return done(err as Error);
      }
    }
  );

export const samlMetadata = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.type('application/xml');
  res.status(200);
  const cert = readFileSync(SAML_SP_CERT_PATH, 'utf8');
  res.send(
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
