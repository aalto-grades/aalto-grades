// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable camelcase */

import {DataTypes, type QueryInterface} from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'user_passkey',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          credential_id: {
            type: DataTypes.STRING(512),
            allowNull: false,
            unique: true,
          },
          public_key: {
            type: DataTypes.TEXT,
            allowNull: false,
          },
          counter: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          provider_name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          authenticator_attachment: {
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
          credential_device_type: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          credential_backed_up: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.addColumn(
        'user',
        'passkey_challenge',
        {
          type: DataTypes.STRING,
          allowNull: true,
        },
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('user', 'passkey_challenge', {
        transaction,
      });
      await queryInterface.dropTable('user_passkey', {transaction});

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
