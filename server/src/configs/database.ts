// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

const username: string = String(process.env.POSTGRES_USER);
const password: string = String(process.env.POSTGRES_PASSWORD);
const database: string = String(process.env.POSTGRES_DATABASE);
const host: string = String(process.env.POSTGRES_URL);

export = {
  username: username,
  password: password,
  database: database,
  host: host,
  dialect: 'postgres',
  migrationStorageTableName: 'migrations'
};
