// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Op,
} from 'sequelize';

import {sequelize} from '..';

export default class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare studentNumber: CreationOptional<string>;
  declare eduUser: CreationOptional<string>;
  declare name: CreationOptional<string>;
  declare role: CreationOptional<string>;
  declare email: CreationOptional<string>;
  declare password: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  static findByEmail: (email: string) => Promise<User | null>;
  static findByEduUser: (eduUser: string) => Promise<User | null>;
  static findIdpUserByEmail: (email: string) => Promise<User | null>;
  static findIdpUsers: () => Promise<Array<User>>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    eduUser: {
      type: new DataTypes.STRING(),
      unique: true,
      allowNull: true,
      defaultValue: null,
    },
    studentNumber: {
      type: new DataTypes.STRING(),
      unique: true,
      allowNull: true,
      defaultValue: null,
    },
    name: {
      type: new DataTypes.STRING(),
      allowNull: true,
      defaultValue: null,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      allowNull: false,
      defaultValue: 'USER',
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: new DataTypes.CHAR(255),
      allowNull: true,
      defaultValue: null,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user',
  }
);

User.findByEmail = async (email: string): Promise<User | null> =>
  await User.findOne({
    where: {
      email,
    },
  });

User.findByEduUser = async (eduUser: string): Promise<User | null> =>
  await User.findOne({
    where: {
      eduUser,
    },
  });

User.findIdpUserByEmail = async (email: string): Promise<User | null> =>
  await User.findOne({
    where: {
      email,
      password: {
        [Op.is]: undefined,
      },
    },
  });

User.findIdpUsers = async (): Promise<User[]> =>
  await User.findAll({
    where: {
      password: {
        [Op.is]: undefined,
      },
    },
  });
