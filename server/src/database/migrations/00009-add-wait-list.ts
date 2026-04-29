// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {DataTypes, type QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'wait_list_entry',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
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
          reason: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          date_added: {
            type: DataTypes.DATEONLY,
            allowNull: false,
          },
          date_resolved: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          status: {
            type: DataTypes.ENUM('PENDING', 'PASSED', 'FAILED'),
            allowNull: false,
            defaultValue: 'PENDING',
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.addIndex(
        'wait_list_entry',
        ['course_id', 'status'],
        {transaction}
      );
      await queryInterface.addIndex('wait_list_entry', ['user_id'], {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('wait_list_entry', {transaction});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
