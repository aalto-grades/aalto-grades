// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Sequelize} from 'sequelize';

import dbCreds from '../configs/database';
import {NODE_ENV} from '../configs/environment';
import logger from '../configs/winston';

// Configure and initialize Sequelize instance with database details and options.
export const sequelize: Sequelize = new Sequelize(
  dbCreds.database,
  dbCreds.username,
  dbCreds.password,
  {
    host: dbCreds.host,
    dialect: 'postgres',
    dialectOptions:
      NODE_ENV === 'production'
        ? {
            ssl: true,
            native: true,
          }
        : undefined,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    logging: (msg: string) =>
      NODE_ENV === 'test' ? undefined : logger.debug(`Sequelize: ${msg}`),
  }
);

// Function to establish connection to the database and log the status.
export const connectToDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('database connected');
  } catch (error) {
    if (typeof error === 'string' || error instanceof Error) {
      logger.error(`database connection failed: ${error.toString()}`);
    } else {
      logger.error('database connection failed with an unknown error type');
    }

    throw new Error('database connection failed');
  }
};
