// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Sequelize } from 'sequelize';

import dbCreds from '../configs/database';

export const sequelize: Sequelize = new Sequelize(
  dbCreds.database,
  dbCreds.username,
  dbCreds.password,
  {
    host: dbCreds.host,
    dialect: 'postgres',
    dialectOptions: {
      // Temporarily commented out so local database connections work
      // TODO: Find a better solution or enable again when taking the system to use?
      //ssl: {
      //  require: true
      //},
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    logging: console.log
  }
);

export const connectToDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('database connected');
  } catch (error) {
    console.log('database connection failed', error);
    throw new Error('database connection failed');
  }
};
