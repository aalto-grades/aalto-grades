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

import {SystemRole} from '@/common/types';
import {sequelize} from '..';

export default class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>;
  declare eduUser: CreationOptional<string | null>;
  declare studentNumber: CreationOptional<string | null>;
  declare name: CreationOptional<string | null>;
  declare role: CreationOptional<SystemRole>;
  declare email: CreationOptional<string | null>;
  declare password: CreationOptional<string | null>;
  declare forcePasswordReset: CreationOptional<boolean | null>;
  declare mfaSecret: CreationOptional<string | null>;
  declare mfaConfirmed: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  static findByEmail: (email: string) => Promise<User | null>;
  static findByEduUser: (eduUser: string) => Promise<User | null>;
  static findIdpUserByEmail: (email: string) => Promise<User | null>;
  static findIdpUsers: () => Promise<User[]>;
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
    },
    studentNumber: {
      type: new DataTypes.STRING(),
      unique: true,
      allowNull: true,
    },
    name: {
      type: new DataTypes.STRING(),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('USER', 'ADMIN'),
      allowNull: false,
      defaultValue: 'USER',
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: new DataTypes.CHAR(255),
      allowNull: true,
    },
    forcePasswordReset: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    mfaSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mfaConfirmed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
  User.findOne({
    where: {
      email,
    },
  });

User.findByEduUser = async (eduUser: string): Promise<User | null> =>
  User.findOne({
    where: {
      eduUser,
    },
  });

User.findIdpUserByEmail = async (email: string): Promise<User | null> =>
  User.findOne({
    where: {
      email,
      password: {
        [Op.is]: undefined,
      },
    },
  });

User.findIdpUsers = async (): Promise<User[]> =>
  User.findAll({
    where: {
      password: {
        [Op.is]: undefined,
      },
    },
  });
