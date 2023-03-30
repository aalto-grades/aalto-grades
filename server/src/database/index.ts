// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Sequelize } from 'sequelize';

import dbCreds from '../configs/database';
import { NODE_ENV } from '../configs/environment';

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
    logging: NODE_ENV === 'development' ? console.log : undefined
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
