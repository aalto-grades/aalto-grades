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
      for (const column of [
        'courseCode',
        'courseName',
        'courseInstance',
        'courseUrl',
        'sourceName',
      ]) {
        await queryInterface.addColumn(
          'aplus_grade_source',
          column,
          {type: DataTypes.STRING, defaultValue: '', allowNull: false},
          {transaction}
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const column of [
        'courseCode',
        'courseName',
        'courseInstance',
        'courseUrl',
        'sourceName',
      ]) {
        await queryInterface.removeColumn('aplus_grade_source', column, {
          transaction,
        });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
