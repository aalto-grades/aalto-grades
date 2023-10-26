// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DataTypes, QueryInterface, Transaction} from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      await queryInterface.addColumn('attainment', 'grade_type', {
        type: DataTypes.ENUM('INTEGER', 'FLOAT'),
        allowNull: false,
        defaultValue: 'FLOAT',
      });
    } catch (error) {
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction =
      await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('attainment', 'grade_type', {
        transaction,
      });

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_attainment_grade_type;',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
