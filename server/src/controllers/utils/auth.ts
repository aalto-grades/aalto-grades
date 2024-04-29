// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode, LoginResult, SystemRole} from '@common/types';
import {
  Profile,
  Strategy as SamlStrategy,
  VerifiedCallback as SamlVerifiedCallback,
} from '@node-saml/passport-saml';
import argon from 'argon2';
import {Request} from 'express';
import {
  SAML_CALLBACK,
  SAML_ENCRYPT_PVK,
  SAML_ENTITY,
  SAML_ENTRYPOINT,
  SAML_IDP_CERT,
  SAML_METADATA_URL,
  SAML_PRIVATE_KEY,
} from '../../configs/environment';
import User from '../../database/models/user';
import {ApiError} from '../../types';
import {getIdpSignCert} from './saml';

/** @throws ApiError(401) */
export const validateLogin = async (
  email: string,
  password: string
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

/** @throws ApiError(401) */
export const getSamlStrategy = async (): Promise<SamlStrategy> =>
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
        if (!user.name || user.name === user.email)
          await user.update({name: name});

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
