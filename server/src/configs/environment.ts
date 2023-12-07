// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// This file reads all environment variables and defines their values as constants.

// Config dotenv so environment variables are also accessible from .env file.
import * as dotenv from 'dotenv';
dotenv.config();
import {readFileSync} from 'fs';
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

export const SAML_CALLBACK: string = '/v1/auth/login-idp/callback';
export const SAML_ENTRYPOINT: string =
  process.env.SAML_ENTRYPOINT ||
  'https://devel.idp.aalto.fi/idp/profile/SAML2/Redirect/SSO';
export const SAML_ENTITY: string =
  process.env.SAML_ENTITY || 'https://aalto-grades.cs.aalto.fi';

let SAML_ENCRYPT_PVK: string = '';
let SAML_PRIVATE_KEY: string = '';
try {
  SAML_ENCRYPT_PVK = readFileSync(
    process.env.ENCRYPT_PVK_FILE || 'keys/aalto-grades.cs.aalto.fi.pem',
    'utf8'
  );
  SAML_PRIVATE_KEY = readFileSync(
    process.env.PRIVATE_KEY_FILE || 'keys/aalto-grades.cs.aalto.fi.pem',
    'utf8'
  );
} catch (err: unknown) {
  if (NODE_ENV === 'production') throw err as Error;
  logger.warn('SAML Private keys not read: ' + (err as Error).message);
}

export {SAML_ENCRYPT_PVK, SAML_PRIVATE_KEY};
export const SAML_SP_CERT_PATH = process.env.SAML_SP_CERT_PATH || 'keys/aalto-grades_cs_aalto_fi_cert.pem'
export const SAML_IDP_CERT: string =
  process.env.SAML_IDP_CERT ||
  'MIIFGzCCAwOgAwIBAgIUCH/Md10XaJNOMEHEpbnvdjn0ABEwDQYJKoZIhvcNAQEL BQAwHTEbMBkGA1UEAwwSZGV2ZWwuaWRwLmFhbHRvLmZpMB4XDTE4MTEyODA3NTEz MFoXDTI4MTEyNTA3NTEzMFowHTEbMBkGA1UEAwwSZGV2ZWwuaWRwLmFhbHRvLmZp MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAx6UGxma5RNicPZ78CzQs 2lXsxj9YblGHJkT7vPQzEJvrLvkL7h6mvwhib64d+/z9rkamU4FzosKn95Ac60rM 3X/GOYgqaNw1i2lmxYuvPtzKxD1QT4aQxPoj9OzHDOfj8WqI5Y3v+5sr0N91TQGE +kFy670wwP8UgYx2knw4AEBGi8Eo3W/gUvFk8adIbtgTDIko1bc8Ktal6j487tTC NrZC/yZulmeNJQKtFA2HxQLvLOdK6NwmS1saTYvBl5i6bQGut9+sme1ZGm6DmOae 4KhoD++0fft7KFISrJJHWsYcR+kzrbKXlNf9uEqmu4bicN97mnzoz7Xf4VkvikJR FvftrJA/DDfsBrTLMdgI9sI2o7R47W4CjjiJTgs71xSMt2gMLtP7pWwjRMAQKXR8 UpecJiBi7f7mxOMrQkG8aHHk6E0kohnvn9cbPtiCCyPTUHWZvb7YKnEHFHAJfWTh P2w7RjnfxNYtfZZ4sIXCCigaOLIA+2xYL+IUW3nJMhruifoQQxe8ZDIkhKfYujqk m6aboRkRmj7dtfruv8xMzACrorIOmxwDCSfKut6hE7BhGRqyxmS3J4HN4v43HGxO kZ6gnrpZADfZsuCdnu6RzXgxMHr5HrHNm0irZn6j8juZZ83QlAkDdSXeiF/uM7Ci S3d8mmPhEEsRr0dHuL8spoMCAwEAAaNTMFEwHQYDVR0OBBYEFAJI4SEtrKp90RN3 4Cspn2e4KfgnMB8GA1UdIwQYMBaAFAJI4SEtrKp90RN34Cspn2e4KfgnMA8GA1Ud EwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggIBAJQdKMAaEhjUAqmakVYqzX/w RXaQhhchsPwFwPW/+gv3VzYC1giS63RGipHZKmlJQmXN/FNaRxbpAXbRs6/HoM+h NTqvqONxd62+pZidE9hRfPaYhqoN/G7xv9VGzYZd52s6leSewKr8nhE4feQqtM2h sboCvzp5qjbrRrtZw/4l1c5VpK7XhkCPcLLTrX2xcrVExe2D3ZJAiuhv9ppg8Mza Fe+l3chYo9oO1+5bYODYWQEV8HlE4ihpP76SyD/egy7uqBcA8448fioWflxIAfG4 xqWnPdUMbTnkMptvrKtT+8cr/+9GoSUZMwP+A1rZaxfz0umtEybDfOlSAv4aWZ9+ lJ+U1/eBEa/a4RgutF+Lb8YPn38suNvX54h1tM/vy95VW1sb+4i6P6so8pdpGty6 uTlhYFChcj9gzrl5p8cVqIhkbuTxpSetKPKI3G1sP7h503yrR/t2KubhDtdbHrhM /bkVJutFeQylksvfbKkNJNyjGeSBiw37PXbWeKH71ZtXPG6uM2teuMhHFhoy6/SK c5Ko3acY1076SK6oGEmhi7Ht53Ae7KUo5dTxPfTXz1nyWpWzsifkS/hd7gdzVGXQ anvYDUMe6iKr6Pbk/soyepefLqHrTqSxWgMtDf4ZhBEHwuRxSkjgSSo1XcTuKULA 2zkmEe3gyHpefW3suPwQ'; // need to get cert from file or ..
