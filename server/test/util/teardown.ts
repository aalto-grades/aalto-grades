// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

// Load environment variables from .env file

import * as dotenv from 'dotenv';

import {resetDb} from './resetDb';

dotenv.config();

const pgHost = process.env.POSTGRES_URL || 'localhost';
const pgUser = process.env.POSTGRES_USER || 'postgres';
const pgPass = process.env.POSTGRES_PASSWORD || 'postgres';
const pgDb = process.env.POSTGRES_DATABASE || 'postgres';
const pgPort = process.env.POSTGRES_PORT
  ? Number(process.env.POSTGRES_PORT)
  : 5432;

const dbConfig = {
  host: pgHost,
  port: pgPort,
  user: pgUser,
  password: pgPass,
  database: pgDb,
};
console.log('Database config:', dbConfig);

export const teardown = async () => {
  console.log('Running teardown...');
  resetDb();
};

export default teardown;
