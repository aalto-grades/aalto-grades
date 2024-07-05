// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Sequelize} from 'sequelize';

import dbCreds from '../configs/database';
import {dbLogger} from '../configs/winston';

// Configure and initialize Sequelize instance with database details and options.
export const sequelize: Sequelize = new Sequelize(
  dbCreds.database,
  dbCreds.username,
  dbCreds.password,
  {
    host: dbCreds.host,
    dialect: 'postgres',
    dialectOptions: undefined,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    logging: (msg: string) => dbLogger.verbose(`Sequelize: ${msg}`),
  }
);

// Function to establish connection to the database and log the status.
export const connectToDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    dbLogger.info('database connected');
  } catch (error) {
    if (typeof error === 'string' || error instanceof Error) {
      dbLogger.error(`database connection failed: ${error.toString()}`);
    } else {
      dbLogger.error('database connection failed with an unknown error type');
    }

    throw new Error('database connection failed');
  }
};
