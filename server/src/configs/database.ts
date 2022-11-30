// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const username = String(process.env.POSTGRES_USER);
const password = String(process.env.POSTGRES_PASSWORD);
const database = String(process.env.POSTGRES_DATABASE);
const host = String(process.env.POSTGRES_URL);

export = {
  username: username,
  password: password,
  database: database,
  host: host,
  dialect: 'postgres',
  migrationStorageTableName: 'migrations'
};
