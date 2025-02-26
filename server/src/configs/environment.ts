// SPDX-FileCopyrightText: 2023 The Ossi Developers
//
// SPDX-License-Identifier: MIT

// This file reads all environment variables and defines their values as constants.

import * as dotenv from 'dotenv';
import {readFileSync} from 'fs';

/** Mock key to use in development */
const devSamlKey = `
-----BEGIN PRIVATE KEY-----
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
RxouvV5JHszKuMt0iNqqSR+/KKx5OA==
-----END PRIVATE KEY-----`.trim();

/** Mock key to use in development */
export const DEV_SAML_IDP_CERT: string = `
-----BEGIN CERTIFICATE-----
MIIFGzCCAwOgAwIBAgIUCH/Md10XaJNOMEHEpbnvdjn0ABEwDQYJKoZIhvcNAQEL
BQAwHTEbMBkGA1UEAwwSZGV2ZWwuaWRwLmFhbHRvLmZpMB4XDTE4MTEyODA3NTEz
MFoXDTI4MTEyNTA3NTEzMFowHTEbMBkGA1UEAwwSZGV2ZWwuaWRwLmFhbHRvLmZp
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAx6UGxma5RNicPZ78CzQs
2lXsxj9YblGHJkT7vPQzEJvrLvkL7h6mvwhib64d+/z9rkamU4FzosKn95Ac60rM
3X/GOYgqaNw1i2lmxYuvPtzKxD1QT4aQxPoj9OzHDOfj8WqI5Y3v+5sr0N91TQGE
+kFy670wwP8UgYx2knw4AEBGi8Eo3W/gUvFk8adIbtgTDIko1bc8Ktal6j487tTC
NrZC/yZulmeNJQKtFA2HxQLvLOdK6NwmS1saTYvBl5i6bQGut9+sme1ZGm6DmOae
4KhoD++0fft7KFISrJJHWsYcR+kzrbKXlNf9uEqmu4bicN97mnzoz7Xf4VkvikJR
FvftrJA/DDfsBrTLMdgI9sI2o7R47W4CjjiJTgs71xSMt2gMLtP7pWwjRMAQKXR8
UpecJiBi7f7mxOMrQkG8aHHk6E0kohnvn9cbPtiCCyPTUHWZvb7YKnEHFHAJfWTh
P2w7RjnfxNYtfZZ4sIXCCigaOLIA+2xYL+IUW3nJMhruifoQQxe8ZDIkhKfYujqk
m6aboRkRmj7dtfruv8xMzACrorIOmxwDCSfKut6hE7BhGRqyxmS3J4HN4v43HGxO
kZ6gnrpZADfZsuCdnu6RzXgxMHr5HrHNm0irZn6j8juZZ83QlAkDdSXeiF/uM7Ci
S3d8mmPhEEsRr0dHuL8spoMCAwEAAaNTMFEwHQYDVR0OBBYEFAJI4SEtrKp90RN3
4Cspn2e4KfgnMB8GA1UdIwQYMBaAFAJI4SEtrKp90RN34Cspn2e4KfgnMA8GA1Ud
EwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggIBAJQdKMAaEhjUAqmakVYqzX/w
RXaQhhchsPwFwPW/+gv3VzYC1giS63RGipHZKmlJQmXN/FNaRxbpAXbRs6/HoM+h
NTqvqONxd62+pZidE9hRfPaYhqoN/G7xv9VGzYZd52s6leSewKr8nhE4feQqtM2h
sboCvzp5qjbrRrtZw/4l1c5VpK7XhkCPcLLTrX2xcrVExe2D3ZJAiuhv9ppg8Mza
Fe+l3chYo9oO1+5bYODYWQEV8HlE4ihpP76SyD/egy7uqBcA8448fioWflxIAfG4
xqWnPdUMbTnkMptvrKtT+8cr/+9GoSUZMwP+A1rZaxfz0umtEybDfOlSAv4aWZ9+
lJ+U1/eBEa/a4RgutF+Lb8YPn38suNvX54h1tM/vy95VW1sb+4i6P6so8pdpGty6
uTlhYFChcj9gzrl5p8cVqIhkbuTxpSetKPKI3G1sP7h503yrR/t2KubhDtdbHrhM
/bkVJutFeQylksvfbKkNJNyjGeSBiw37PXbWeKH71ZtXPG6uM2teuMhHFhoy6/SK
c5Ko3acY1076SK6oGEmhi7Ht53Ae7KUo5dTxPfTXz1nyWpWzsifkS/hd7gdzVGXQ
anvYDUMe6iKr6Pbk/soyepefLqHrTqSxWgMtDf4ZhBEHwuRxSkjgSSo1XcTuKULA
2zkmEe3gyHpefW3suPwQ
-----END CERTIFICATE-----`.trim();

const defaults = {
  nodeEnv: 'development',
  backendPort: 3000,
  jwtSecret: 'TOP_SECRET',
  frontendCorsOrigin: 'http://localhost:3005',
  // TODO: Fix SAML callback url to include /api/ (#848)
  samlCallback: 'https://aalto-grades.cs.aalto.fi/v1/auth/login-idp/callback',
  samlEntrypoint: 'https://devel.idp.aalto.fi/idp/profile/SAML2/Redirect/SSO',
  samlIssuer: 'https://aalto-grades.cs.aalto.fi',
  samlMetadataUrl: 'https://devel.idp.aalto.fi/idp/shibboleth',
  aPlusApiUrl: 'https://plus.cs.aalto.fi/api/v2',

  // Hardcoded because production docker compose always copies to the same filename
  samlDecryptionKeyFile: '/keys/saml-decryption-key.pem',
  samlPrivateKeyFile: '/keys/saml-private-key.pem',
  samlSpCertFile: '/keys/saml-sp-cert.pem',

  // Sisu API, default token is just a placeholder, not valid.
  sisuApiToken: '507f508dfa595cc9kya86d9200c7cca9f',
  sisuApiUrl: 'https://course.api.aalto.fi:443/api/sisu/v1',
};

// Config dotenv so environment variables are also accessible from .env file.
dotenv.config();

type NodeEnv = 'test' | 'development' | 'production';
export const NODE_ENV: NodeEnv = (process.env.NODE_ENV ||
  defaults.nodeEnv) as NodeEnv;
if (!['test', 'development', 'production'].includes(NODE_ENV)) {
  throw new Error(
    `Invalid NODE_ENV '${NODE_ENV}'. Possible values are 'test', 'development', and 'production'`
  );
}

// The logger needs NODE_ENV to be defined so it has to be imported after it has been defined
import httpLogger from './winston';

if (NODE_ENV === 'development')
  httpLogger.warn('NODE_ENV = development, TOTP codes will not be validated');

const parsedPort: number = Number(process.env.AALTO_GRADES_BACKEND_PORT);
export const BACKEND_PORT: number = isNaN(parsedPort)
  ? defaults.backendPort
  : parsedPort;

export const JWT_SECRET: string =
  process.env.AALTO_GRADES_JWT_SECRET || defaults.jwtSecret;
if (NODE_ENV !== 'test' && JWT_SECRET === defaults.jwtSecret) {
  // Don't allow running production with default secret!
  if (NODE_ENV === 'production') {
    throw new Error(
      'AALTO_GRADES_JWT_SECRET must be defined for the production environment!'
    );
  } else {
    httpLogger.warn(
      'No AALTO_GRADES_JWT_SECRET specified, using default value. Do not do this in production.'
    );
  }
}

export const FRONTEND_ORIGIN: string =
  process.env.AALTO_GRADES_FRONTEND_CORS_ORIGIN || defaults.frontendCorsOrigin;

export const SAML_CALLBACK: string =
  process.env.SAML_CALLBACK || defaults.samlCallback;
export const SAML_ENTRYPOINT: string =
  process.env.SAML_ENTRYPOINT || defaults.samlEntrypoint;
export const SAML_ISSUER: string =
  process.env.SAML_ISSUER || defaults.samlIssuer;
export const SAML_METADATA_URL: string =
  process.env.SAML_METADATA_URL || defaults.samlMetadataUrl;

// Default to dev key
let SAML_DECRYPTION_PVK: string = devSamlKey;
let SAML_PRIVATE_KEY: string = devSamlKey;
try {
  SAML_DECRYPTION_PVK = readFileSync(defaults.samlDecryptionKeyFile, 'utf8');
  SAML_PRIVATE_KEY = readFileSync(defaults.samlPrivateKeyFile, 'utf8');
} catch (error) {
  if (NODE_ENV === 'production') throw error as Error;
  httpLogger.warn('SAML Private keys not read: ' + (error as Error).message);
}
export {SAML_DECRYPTION_PVK, SAML_PRIVATE_KEY};

export const SAML_SP_CERT_FILE = defaults.samlSpCertFile;

export const APLUS_API_URL = process.env.APLUS_API_URL || defaults.aPlusApiUrl;

export const SISU_API_URL: string =
  process.env.SISU_API_URL || defaults.sisuApiUrl;
export const SISU_API_TOKEN: string =
  process.env.SISU_API_TOKEN || defaults.sisuApiToken;
export const ENABLE_SISU_MOCKS: boolean =
  SISU_API_TOKEN === defaults.sisuApiToken && NODE_ENV !== 'test';

if (ENABLE_SISU_MOCKS) {
  httpLogger.warn(
    'No SISU_API_TOKEN specified, using default value. Sisu endpoints will return only mock data'
  );
}
