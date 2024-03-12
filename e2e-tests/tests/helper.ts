// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Client} from 'pg';

const pghost = process.env.POSTGRES_URL || 'localhost';
const pguser = process.env.POSTGRES_USER || 'postgres';
const pgpass = process.env.POSTGRES_PASSWORD || 'postgres';
const pgdb = process.env.POSTGRES_DATABASE || 'postgres';
const pgport = process.env.POSTGRES_PORT
  ? Number(process.env.POSTGRES_PORT)
  : 5432;

const dbConfig = {
  host: pghost,
  port: pgport,
  user: pguser,
  password: pgpass,
  database: pgdb,
};

const dbConfigClean = {
  host: pghost,
  port: pgport,
  user: pguser,
  password: pgpass,
  database: 'postgres_copy',
};

export const setupDb = async () => {
  // Create a copy of current database
  const client = new Client(dbConfig);
  await client.connect();
  const dbQuery = await client.query(
    "SELECT FROM pg_database WHERE datname = 'postgres_copy'"
  );
  if (dbQuery.rowCount === 0) {
    await client.query(
      `CREATE DATABASE postgres_copy WITH TEMPLATE postgres OWNER ${pguser}`
    );
  }
  await client.end();
};

export const cleanDb = async () => {
  // Remove current database and replace with copy
  const client = new Client(dbConfigClean);
  await client.connect();
  const dbQuery = await client.query(
    `SELECT FROM pg_database WHERE datname = '${pgdb}'`
  );
  if (dbQuery.rowCount !== 0) {
    await client.query(`DROP DATABASE ${pgdb} WITH (FORCE)`);
  }
  await client.query(
    `CREATE DATABASE ${pgdb} WITH TEMPLATE postgres_copy OWNER ${pguser}`
  );
  await client.end();
};
