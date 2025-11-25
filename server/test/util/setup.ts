// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

// Load environment variables from .env file

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import pg from 'pg';

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

/**
 * Creates the checkpoint for the database, will be needed to restore the db
 * after tests
 */

const setup = async (): Promise<void> => {
  const client = new pg.Client(dbConfig);
  await client.connect();

  // Checkpoint exists?
  const dbCheckpointQuery = await client.query(
    "SELECT FROM pg_database WHERE datname = 'postgres_copy'",
  );
  if (dbCheckpointQuery.rowCount !== 0) {
    console.log('Checkpoint database already exists');

    // Original db exists?
    const dbOriginalQuery = await client.query(
      `SELECT FROM pg_database WHERE datname = '${pgUser}'`,
    );

    // If the original db does not exist, reset if the checkpoint exists
    if (dbOriginalQuery.rowCount === 0) {
      if (dbCheckpointQuery.rowCount === 0) {
        throw new Error(
          `Original and checkpoint database do not exist, please create the ${pgDb}`,
        );
      }
      console.log(
        'Original database does not exist, resetting db to checkpoint state',
      );
      resetDb();
    }

    console.log('Dropping existing checkpoint database');
    await client.query('DROP DATABASE postgres_copy');
  }

  // Create new copy
  await client.query(
    `CREATE DATABASE "postgres_copy" WITH TEMPLATE "postgres" OWNER "${pgUser}"`,
  );

  // Checkpoint exists?
  if (
    (
      await client.query(
        "SELECT FROM pg_database WHERE datname = 'postgres_copy'",
      )
    ).rowCount === 0
  ) {
    throw new Error('Failed to create checkpoint database');
  }

  // Fetch user IDs for tests
  const userQuery = await client.query(
    "SELECT id, email FROM \"user\" WHERE email IN ('admin@aalto.fi', 'teacher@aalto.fi', 'assistant@aalto.fi', 'student@aalto.fi')"
  );

  const ids: Record<string, number> = {};
  userQuery.rows.forEach((row: {id: number; email: string}) => {
    if (row.email === 'admin@aalto.fi') ids.ADMIN_ID = row.id;
    if (row.email === 'teacher@aalto.fi') ids.TEACHER_ID = row.id;
    if (row.email === 'assistant@aalto.fi') ids.ASSISTANT_ID = row.id;
    if (row.email === 'student@aalto.fi') ids.STUDENT_ID = row.id;
  });

  fs.writeFileSync(
    path.join(__dirname, 'test-ids.json'),
    JSON.stringify(ids, null, 2)
  );

  await client.end();
};

module.exports = setup;
