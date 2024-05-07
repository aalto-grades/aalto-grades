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
        'attainment',
        'archived',
        {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: true},
        {transaction}
      );
      await queryInterface.addColumn(
        'assessment_model',
        'archived',
        {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: true},
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
      await queryInterface.removeColumn('attainment', 'archived', {
        transaction,
      });
      await queryInterface.removeColumn('assessment_model', 'archived', {
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
