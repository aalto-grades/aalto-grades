// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import 'dotenv/config';
import {Client} from 'pg';

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

const dbConfigClean = {
  host: pgHost,
  port: pgPort,
  user: pgUser,
  password: pgPass,
  database: 'postgres_copy',
};

export const setupDb = async (): Promise<void> => {
  // Create a copy of current database
  const client = new Client(dbConfig);
  await client.connect();
  const dbQuery = await client.query(
    "SELECT FROM pg_database WHERE datname = 'postgres_copy'"
  );
  if (dbQuery.rowCount === 0) {
    await client.query(
      `CREATE DATABASE postgres_copy WITH TEMPLATE postgres OWNER ${pgUser}`
    );
  }
  await client.end();
};

export const cleanDb = async (): Promise<void> => {
  // Remove current database and replace with copy
  const client = new Client(dbConfigClean);
  await client.connect();
  const dbQuery = await client.query(
    `SELECT FROM pg_database WHERE datname = '${pgDb}'`
  );
  if (dbQuery.rowCount !== 0) {
    await client.query(`DROP DATABASE ${pgDb} WITH (FORCE)`);
  }
  await client.query(
    `CREATE DATABASE ${pgDb} WITH TEMPLATE postgres_copy OWNER ${pgUser}`
  );
  await client.end();
};
