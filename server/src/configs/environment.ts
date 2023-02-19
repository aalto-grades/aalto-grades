// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// This file reads all environment variables and defines their values as constants.

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

export const TEST_ENV: boolean = process.env.AALTO_GRADES_TEST_ENVIRONMENT === 'true';
export const JWT_SECRET: string = process.env.AALTO_GRADES_JWT_SECRET || 'TOP_SECRET';
export const FRONTEND_ORIGIN: string =
  process.env.AALTO_GRADES_FRONTED_CORS_ORIGIN || 'http://localhost:3005';

if (JWT_SECRET === 'TOP_SECRET') {
  console.warn(
    'No AALTO_GRADES_JWT_SECRET specified, using default value. Do not do this in production.'
  );
}
