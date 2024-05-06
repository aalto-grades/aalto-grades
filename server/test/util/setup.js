// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/** Not sure how to make this work as a typescript file :/ */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pg = require('pg');

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

/** Creates a copy of the current database. */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const setup = async () => {
  const client = new pg.Client(dbConfig);
  await client.connect();

  // Delete old copy if exists
  const dbQuery = await client.query(
    "SELECT FROM pg_database WHERE datname = 'postgres_copy'"
  );
  if (dbQuery.rowCount !== 0) {
    await client.query('DROP DATABASE postgres_copy');
  }

  // Create new copy
  await client.query(
    `CREATE DATABASE postgres_copy WITH TEMPLATE postgres OWNER ${pguser}`
  );

  await client.end();
};

module.exports = setup;
