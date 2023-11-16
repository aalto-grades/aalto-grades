// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// This file reads all environment variables and defines their values as constants.

// Config dotenv so environment variables are also accessible from .env file.
import * as dotenv from 'dotenv';
dotenv.config();

import logger from './winston';

const parsedPort: number = Number(process.env.AALTO_GRADES_BACKEND_PORT);
export const PORT: number = isNaN(parsedPort) ? 3000 : parsedPort;

export const SISU_API_KEY: string | undefined = process.env.SISU_API_KEY;
export const SISU_API_URL: string | undefined = process.env.SISU_API_URL;
export const NODE_ENV: string = process.env.NODE_ENV ?? 'development';

if ((!SISU_API_KEY || !SISU_API_URL) && NODE_ENV === 'production') {
  throw new Error(
    'SISU_API_KEY and/or SISU_API_URL environment variable(s) undefined, required in production.'
  );
}

export const JWT_SECRET: string =
  process.env.AALTO_GRADES_JWT_SECRET || 'TOP_SECRET';
export const FRONTEND_ORIGIN: string =
  process.env.AALTO_GRADES_FRONTEND_CORS_ORIGIN || 'http://localhost:3005';

if (JWT_SECRET === 'TOP_SECRET' && NODE_ENV !== 'test') {
  if (NODE_ENV === 'production') {
    // Don't allow running production with default secret!
    throw new Error(
      'AALTO_GRADES_JWT_SECRET must be defined for the production environment!'
    );
  } else {
    logger.warn(
      'No AALTO_GRADES_JWT_SECRET specified, using default value. Do not do this in production.'
    );
  }
}

export const SAML_CALLBACK: string = '/login-idp/callback';
export const SAML_ENTRYPOINT: string =
  'https://idp.webapplication.com/idp/profile/SAML2/Redirect/SSO';
export const SAML_ENTITY: string = 'aalto-grades';
export const SAML_IDP_CERT: string = ''; // need to get cert from file or ..
export const SAML_ENCRYPT_PVK: string = '';
export const SAML_PRIVATE_KEY: string = '';
