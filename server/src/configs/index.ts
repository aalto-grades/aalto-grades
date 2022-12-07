// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const parsedPort = Number(process.env.AALTO_GRADES_BACKEND_PORT);
const port: number = isNaN(parsedPort) ? 3000 : parsedPort;
const jwtSecret: string =  process.env.AALTO_GRADES_JWT_SECRET || 'TOP_SECRET';
if (jwtSecret == 'TOP_SECRET') {
  console.warn('No AALTO_GRADES_JWT_SECRET specified, using default value. Do not do this in production.');
}

export {
  jwtSecret,
  port,
};
