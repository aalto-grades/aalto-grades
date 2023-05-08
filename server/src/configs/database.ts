// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// This file defines database credentials for use with Sequelize.

require('./env');

const USER: string = String(process.env.POSTGRES_USER);
const PASSWORD: string = String(process.env.POSTGRES_PASSWORD);
const DATABASE: string = String(process.env.POSTGRES_DATABASE);
const URL: string = String(process.env.POSTGRES_URL);

export = {
  username: USER,
  password: PASSWORD,
  database: DATABASE,
  host: URL,
  dialect: 'postgres',
  migrationStorageTableName: 'migrations',
  seederStorage: 'sequelize',
  seederStorageTableName: 'seeds'
};
