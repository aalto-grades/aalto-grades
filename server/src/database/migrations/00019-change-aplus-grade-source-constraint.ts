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
      // RESTRICT -> CASCADE
      await queryInterface.removeConstraint(
        'aplus_grade_source',
        'aplus_grade_source_attainment_id_fkey',
        {transaction}
      );
      await queryInterface.addConstraint('aplus_grade_source', {
        type: 'foreign key',
        fields: ['course_part_id'],
        name: 'aplus_grade_source_course_part_id_fkey',
        references: {table: 'course_part', field: 'id'},
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
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // CASCADE -> RESTRICT
      await queryInterface.removeConstraint(
        'aplus_grade_source',
        'aplus_grade_source_course_part_id_fkey',
        {transaction}
      );
      await queryInterface.addConstraint('aplus_grade_source', {
        type: 'foreign key',
        fields: ['course_part_id'],
        name: 'aplus_grade_source_attainment_id_fkey',
        references: {table: 'course_part', field: 'id'},
        onDelete: 'RESTRICT',
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
