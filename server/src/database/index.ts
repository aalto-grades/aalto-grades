// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Sequelize } from 'sequelize';

import dbCreds from '../configs/database';
import { NODE_ENV } from '../configs/environment';
import logger from '../configs/winston';

export const sequelize: Sequelize = new Sequelize(
  dbCreds.database,
  dbCreds.username,
  dbCreds.password,
  {
    host: dbCreds.host,
    dialect: 'postgres',
    dialectOptions: NODE_ENV === 'production' ? {
      ssl: {
        require: true
      }
    } : undefined,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    },
    logging: (msg: string) => logger.debug(`Sequelize: ${msg}`)
  }
);

export async function connectToDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('database connected');
  } catch (error) {
    logger.error(`database connection failed: ${error}`);
    throw new Error('database connection failed');
  }
}
