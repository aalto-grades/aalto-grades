// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addConstraint('course', {
        fields: ['course_code'],
        type: 'unique',
        name: 'course_course_code_un',
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('course', 'course_course_code_un', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
