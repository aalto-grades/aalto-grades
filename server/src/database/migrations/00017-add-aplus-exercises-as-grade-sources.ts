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
      await queryInterface.addColumn(
        'aplus_grade_source',
        'exercise_id',
        {
          type: DataTypes.INTEGER,
          defaultValue: null,
          allowNull: true,
        },
        {transaction}
      );

      await queryInterface.addColumn(
        'aplus_grade_source',
        'exercise_name',
        {
          type: DataTypes.STRING,
          defaultValue: null,
          allowNull: true,
        },
        {transaction}
      );

      await queryInterface.sequelize.query(
        "ALTER TYPE enum_aplus_grade_source_source_type ADD VALUE 'EXERCISE' AFTER 'MODULE';",
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
      await queryInterface.removeColumn('aplus_grade_source', 'exercise_id', {
        transaction,
      });

      await queryInterface.removeColumn('aplus_grade_source', 'exercise_name', {
        transaction,
      });

      await queryInterface.bulkDelete(
        'aplus_grade_source',
        {source_type: 'EXERCISE'},
        {transaction}
      );

      await queryInterface.changeColumn(
        'aplus_grade_source',
        'source_type',
        {type: DataTypes.STRING},
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_aplus_grade_source_source_type;',
        {transaction}
      );

      await queryInterface.changeColumn(
        'aplus_grade_source',
        'source_type',
        {
          type: DataTypes.ENUM('FULL_POINTS', 'MODULE', 'DIFFICULTY'),
          allowNull: false,
        },
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
