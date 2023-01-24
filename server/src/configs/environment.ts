// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const SISU_API_KEY: string | undefined = process.env.SISU_API_KEY;
const SISU_API_URL: string | undefined = process.env.SISU_API_URL;
const NODE_ENV: string = process.env.NODE_ENV ?? 'development';
const parsedPort: number = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const PORT: number = isNaN(parsedPort) ? 3000 : parsedPort;

if ((!SISU_API_KEY || !SISU_API_URL) && NODE_ENV === 'production') {
  throw new Error('SISU_API_KEY and/or SISU_API_URL environment variable(s) undefined, required in production');
}

export {
  SISU_API_KEY,
  SISU_API_URL,
  NODE_ENV,
  PORT
};
