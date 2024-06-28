// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {QueryInterface} from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // CASCADE -> NO ACTION
      await queryInterface.removeConstraint(
        'attainment_grade',
        'attainment_grade_grader_id_fkey',
        {transaction}
      );
      await queryInterface.addConstraint('attainment_grade', {
        type: 'foreign key',
        fields: ['grader_id'],
        name: 'attainment_grade_grader_id_fkey',
        references: {table: 'user', field: 'id'},
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // NO ACTION -> CASCADE
      await queryInterface.removeConstraint(
        'attainment_grade',
        'attainment_grade_grader_id_fkey',
        {transaction}
      );
      await queryInterface.addConstraint('attainment_grade', {
        type: 'foreign key',
        fields: ['grader_id'],
        name: 'attainment_grade_grader_id_fkey',
        references: {table: 'user', field: 'id'},
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
