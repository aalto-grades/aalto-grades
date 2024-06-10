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
        'aplus_course',
        {type: DataTypes.JSONB, defaultValue: {}, allowNull: false},
        {transaction}
      );

      await queryInterface.addColumn(
        'aplus_grade_source',
        'module_name',
        {type: DataTypes.STRING, defaultValue: null, allowNull: true},
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
      await queryInterface.removeColumn('aplus_grade_source', 'aplus_course', {
        transaction,
      });

      await queryInterface.removeColumn('aplus_grade_source', 'module_name', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
