import { Sequelize } from 'sequelize';
import dbCreds from '../configs/database';

export const sequelize = new Sequelize(dbCreds.database, dbCreds.username, dbCreds.password, {
  host: dbCreds.host,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  },
  logging: console.log
});

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('database connected');
  } catch (error) {
    console.log('database connecting failed', error);
    return process.exit(1);
  }
  return null;
};
