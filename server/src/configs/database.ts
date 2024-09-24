// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// This file defines database credentials for use with Sequelize.

import './environment';

const USER = process.env.POSTGRES_USER || 'postgres';
const PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres';
const DATABASE = process.env.POSTGRES_DATABASE || 'postgres';
const URL = process.env.POSTGRES_URL || 'localhost';

export = {
  username: USER,
  password: PASSWORD,
  database: DATABASE,
  host: URL,
  dialect: 'postgres',
  migrationStorageTableName: 'migrations',
  seederStorage: 'sequelize',
  seederStorageTableName: 'seeds',
};
