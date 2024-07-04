// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {DataTypes, QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Create the new table with id primary key
      await queryInterface.createTable(
        'course_role_new',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          course_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          role: {
            type: 'enum_course_role_role',
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      // Copy data from old table to new table
      await queryInterface.sequelize.query(
        `INSERT INTO course_role_new (user_id, course_id, role, created_at, updated_at)
         SELECT user_id, course_id, role, created_At, updated_at FROM course_role`,
        {transaction}
      );

      // Drop the old table
      await queryInterface.dropTable('course_role', {transaction});

      // Rename the new table to the old table's name
      await queryInterface.renameTable('course_role_new', 'course_role', {
        transaction,
      });

      // Add non-unique index
      await queryInterface.addIndex('course_role', ['user_id', 'course_id'], {
        unique: false,
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
      // Create the new table with the old structure
      await queryInterface.createTable(
        'course_role_new',
        {
          user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          course_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          role: {
            type: 'enum_course_role_role',
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      // Copy data from old table to new table
      await queryInterface.sequelize.query(
        `INSERT INTO course_role_new (user_id, course_id, role, created_at, updated_at)
         SELECT user_id, course_id, role, created_at, updated_at FROM course_role`,
        {transaction}
      );

      // Drop the old table
      await queryInterface.dropTable('course_role', {transaction});

      // Rename the new table to the old table's name
      await queryInterface.renameTable('course_role_new', 'course_role', {
        transaction,
      });

      // Add unique index
      await queryInterface.addIndex('course_role', ['user_id', 'course_id'], {
        unique: true,
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
