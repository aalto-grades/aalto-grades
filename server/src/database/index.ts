// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Sequelize } from 'sequelize';
import dbCreds from '../configs/database';

export const sequelize = new Sequelize(dbCreds.database, dbCreds.username, dbCreds.password, {
  host: dbCreds.host,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true
    },
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  logging: console.log
});

export const connectToDatabase = async (): Promise<void | NodeJS.Process> => {
  try {
    await sequelize.authenticate();
    console.log('database connected');
  } catch (error) {
    console.log('database connecting failed', error);
    return process.exit(1);
  }
};
