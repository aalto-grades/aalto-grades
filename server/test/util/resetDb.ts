// SPDX-FileCopyrightText: 2024 The Ossi Developers
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

  try {
    // Check if the target database exists
    const dbQuery = await client.query(
      `SELECT FROM pg_database WHERE datname = '${pgDb}'`
    );

    if (dbQuery.rowCount !== 0) {
      // Create the new database first with a temporary name
      const tempDbName = `${pgDb}_temp_${Date.now()}`;
      await client.query(
        `CREATE DATABASE "${tempDbName}" WITH TEMPLATE postgres_copy OWNER "${pgUser}"`
      );
      // Only after successful creation, drop the old database and rename
      await client.query(`DROP DATABASE "${pgDb}" WITH (FORCE)`);
      await client.query(`ALTER DATABASE "${tempDbName}" RENAME TO "${pgDb}"`);
    } else {
      // Database doesn't exist, just create it directly
      await client.query(
        `CREATE DATABASE "${pgDb}" WITH TEMPLATE postgres_copy OWNER "${pgUser}"`
      );
    }
  } finally {
    await client.end();
  }
};
