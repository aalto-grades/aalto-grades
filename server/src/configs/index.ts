// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const parsedPort: number = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;
const testEnv: boolean = process.env.AALTO_GRADES_TEST_ENVIRONMENT == 'true';
const jwtSecret: string =  process.env.AALTO_GRADES_JWT_SECRET || 'TOP_SECRET';
const frontendOrigin: string = process.env.AALTO_GRADES_FRONTED_CORS_ORIGIN || 'http://localhost:3005';

if (jwtSecret == 'TOP_SECRET') {
  console.warn('No AALTO_GRADES_JWT_SECRET specified, using default value. Do not do this in production.');
}

export {
  jwtSecret,
  port,
  testEnv,
  frontendOrigin,
};
