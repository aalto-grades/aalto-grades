// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type Profile,
  Strategy as SamlStrategy,
  type VerifiedCallback as SamlVerifiedCallback,
} from '@node-saml/passport-saml';
import {DOMParser} from '@xmldom/xmldom';
import axios from 'axios';
import type {Request} from 'express';
import {type SelectReturnType, isArrayOfNodes, useNamespaces} from 'xpath';

import {HttpCode, type SystemRole} from '@/common/types';
import {
  DEV_SAML_IDP_CERT,
  NODE_ENV,
  SAML_CALLBACK,
  SAML_DECRYPTION_PVK,
  SAML_ENTRYPOINT,
  SAML_ISSUER,
  SAML_METADATA_URL,
  SAML_PRIVATE_KEY,
} from '../../configs/environment';
import httpLogger from '../../configs/winston';
import User from '../../database/models/user';
import {ApiError} from '../../types';

type selectFun = (query: string) => SelectReturnType;

export const fetchIdpMetadata = async (
  metadataUrl: string
): Promise<selectFun | null> => {
  try {
    const res = await axios.get<string>(metadataUrl);
    const parser = new DOMParser();
    const xml = parser.parseFromString(res.data, 'application/xml');
    const select = useNamespaces({
      md: 'urn:oasis:names:tc:SAML:2.0:metadata',
      saml: 'urn:oasis:names:tc:SAML:2.0:assertion',
      ds: 'http://www.w3.org/2000/09/xmldsig#',
    });
    return query => select(query, xml);
  } catch (error) {
    httpLogger.error(error);
    return null;
  }
};

export const getIdpSignCert = async (
  metadataUrl: string
): Promise<string | null | undefined> => {
  const query = await fetchIdpMetadata(metadataUrl);
  let result = null;
  if (query) {
    const res = query(
      '//md:IDPSSODescriptor/md:KeyDescriptor[@use="signing" or not(@use)]/ds:KeyInfo/ds:X509Data/ds:X509Certificate'
    );
    if (isArrayOfNodes(res)) {
      result = res.map(node => node.firstChild?.nodeValue)[0]?.trim();
    }
  }
  if ((result === null || result === undefined) && NODE_ENV === 'production') {
    httpLogger.error('Failed to get IDP signing cert');
    throw new Error('Failed to get IDP signing cert');
  }
  return result;
};

/** @throws ApiError(401) */
export const getSamlStrategy = async (): Promise<SamlStrategy> =>
  new SamlStrategy(
    {
      callbackUrl: SAML_CALLBACK,
      entryPoint: SAML_ENTRYPOINT,
      issuer: SAML_ISSUER,
      cert: (await getIdpSignCert(SAML_METADATA_URL)) ?? DEV_SAML_IDP_CERT, // IdP public key in .pem format
      decryptionPvk: SAML_DECRYPTION_PVK,
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

        // for now if teacher email is added by admin we allow the teacher to sign in
        return done(null, {
          id: user.id,
          role: user.role as SystemRole,
          name: user.name,
        });
      } catch (error) {
        return done(error as Error);
      }
    },
    (_req: Request, profile: Profile | null, done: SamlVerifiedCallback) => {
      // for logout
      try {
        return done(null, {profile});
      } catch (error) {
        return done(error as Error);
      }
    }
  );
