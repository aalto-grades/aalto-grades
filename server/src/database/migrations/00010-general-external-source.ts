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
        'external_source',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          external_course: {
            type: DataTypes.JSONB,
            allowNull: false,
          },
          external_service_name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          source_info: {
            type: DataTypes.JSONB,
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'course_task_external_source',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          course_task_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'course_task',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          external_source_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'external_source',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.addConstraint('course_task_external_source', {
        fields: ['course_task_id', 'external_source_id'],
        type: 'unique',
        name: 'course_task_external_source_unique_link',
        transaction,
      });

      await queryInterface.addColumn(
        'task_grade',
        'external_source_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'external_source',
            key: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        },
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('task_grade', 'external_source_id', {
        transaction,
      });

      await queryInterface.removeConstraint(
        'course_task_external_source',
        'course_task_external_source_unique_link',
        {transaction}
      );

      await queryInterface.dropTable('course_task_external_source', {
        transaction,
      });

      await queryInterface.dropTable('external_source', {transaction});

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
