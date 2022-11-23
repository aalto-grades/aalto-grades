import { Sequelize } from 'sequelize';
const database = String(process.env.DB_DATABASE);
const username = String(process.env.DB_USERNAME);
const password = String(process.env.DB_PASSWORD);
const host = String(process.env.DB_HOST);

export const sequelize = new Sequelize(database, username, password, {
  host: host,
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
