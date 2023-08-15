// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { DataTypes, QueryInterface, Transaction } from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'attainment', 'max_grade',
        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 },
        { transaction }
      );

      await queryInterface.changeColumn(
        'attainment', 'min_required_grade',
        { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        'attainment', 'max_grade', { transaction }
      );
      await queryInterface.removeColumn(
        'attainment', 'min_required_grade', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  }
};
