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
      await queryInterface.addIndex('course', ['course_code'], {
        unique: false, // TODO: should this be unique?
        transaction,
      });

      await queryInterface.addIndex('user', ['student_number'], {
        unique: false,
        transaction,
      });

      await queryInterface.addIndex('course_role', ['user_id', 'course_id'], {
        unique: true,
        transaction,
      });

      await queryInterface.addIndex(
        'course_translation',
        ['course_id', 'language'],
        {
          unique: true,
          transaction,
        }
      );

      await queryInterface.addIndex(
        'attainment_grade',
        ['user_id', 'attainment_id'],
        {
          unique: false,
          transaction,
        }
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
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_course_code',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS user_student_number',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_role_user_id_course_id',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_translation_course_id_language',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS attainment_grade_user_id_attainment_id',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
