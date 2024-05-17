// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {DataTypes, QueryInterface} from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'aplus_grade_source',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          attainment_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'attainment',
              key: 'id',
            },
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          aplus_course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          source_type: {
            type: DataTypes.ENUM('FULL_POINTS', 'MODULE', 'DIFFICULTY'),
            allowNull: false,
          },
          module_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          difficulty: {
            type: new DataTypes.STRING(),
            allowNull: true,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('aplus_grade_source', {transaction});

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
