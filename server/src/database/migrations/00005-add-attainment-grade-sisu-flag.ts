// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { DataTypes, QueryInterface } from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      await queryInterface.addColumn(
        'attainment_grade', 'sisu_export_date',
        { type: DataTypes.DATE, allowNull: true, defaultValue: null }
      );
    } catch (error) {
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      await queryInterface.removeColumn('attainment_grade', 'sisu_export_date');
    } catch (error) {
      logger.error(error);
    }
  }
};
