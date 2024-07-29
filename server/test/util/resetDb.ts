// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Client} from 'pg';

const pgHost = process.env.POSTGRES_URL || 'localhost';
const pgUser = process.env.POSTGRES_USER || 'postgres';
const pgPass = process.env.POSTGRES_PASSWORD || 'postgres';
const pgDb = process.env.POSTGRES_DATABASE || 'postgres';
const pgPort = process.env.POSTGRES_PORT
  ? Number(process.env.POSTGRES_PORT)
  : 5432;

const dbConfigClean = {
  host: pgHost,
  port: pgPort,
  user: pgUser,
  password: pgPass,
  database: 'postgres_copy',
};

/** Resets db to the state it was in before any tests ran */
export const resetDb = async (): Promise<void> => {
  const client = new Client(dbConfigClean);
  await client.connect();

  // Remove current database and replace with copy
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
