// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable camelcase */

import {DataTypes, type QueryInterface} from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'final_grade',
        'frozen_info',
        {
          type: DataTypes.JSON,
          allowNull: true,
        },
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('final_grade', 'frozen_info', {transaction});

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
