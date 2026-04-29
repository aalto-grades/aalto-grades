// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from 'sequelize';

import {sequelize} from '..';

export default class Passkey extends Model<
  InferAttributes<Passkey>,
  InferCreationAttributes<Passkey>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare credentialId: string;
  declare publicKey: string;
  declare counter: number;
  declare providerName: CreationOptional<string | null>;
  declare authenticatorAttachment: CreationOptional<string | null>;
  declare transports: CreationOptional<string[] | null>;
  declare aaguid: string;
  declare credentialDeviceType: string;
  declare credentialBackedUp: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Passkey.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    credentialId: {
      type: DataTypes.STRING(512),
      allowNull: false,
      unique: true,
    },
    publicKey: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    counter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    providerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authenticatorAttachment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transports: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    aaguid: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    credentialDeviceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    credentialBackedUp: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user_passkey',
  }
);
