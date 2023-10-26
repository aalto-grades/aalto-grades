// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {QueryInterface, Op} from 'sequelize';

import {sequelize} from '..';
import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      await queryInterface.addConstraint('attainment_grade', {
        fields: ['date'],
        type: 'check',
        where: {
          date: {
            [Op.lte]: sequelize.col('expiry_date'),
          },
        },
      });
    } catch (error) {
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      await queryInterface.removeConstraint(
        'attainment_grade',
        'attainment_grade_date_ck'
      );
    } catch (error) {
      logger.error(error);
    }
  },
};
