// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {DataTypes, QueryInterface, Transaction} from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction =
      await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'attainment_grade',
        'date',
        {type: DataTypes.DATEONLY, allowNull: true},
        {transaction}
      );

      await queryInterface.changeColumn(
        'attainment_grade',
        'expiry_date',
        {type: DataTypes.DATEONLY, allowNull: true},
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction =
      await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'attainment_grade',
        'date',
        {type: DataTypes.DATE, allowNull: true},
        {transaction}
      );

      await queryInterface.changeColumn(
        'attainment_grade',
        'expiry_date',
        {type: DataTypes.DATE, allowNull: true},
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
