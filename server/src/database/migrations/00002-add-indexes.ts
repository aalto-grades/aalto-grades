// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addIndex('course', ['course_code'], {
        unique: false,
        transaction,
      });

      await queryInterface.addIndex('user', ['student_number'], {
        unique: false,
        transaction,
      });

      await queryInterface.addIndex('course_role', ['user_id', 'course_id'], {
        unique: false,
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
        'task_grade',
        ['user_id', 'course_task_id'],
        {
          unique: false,
          transaction,
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query('DROP INDEX course_course_code', {
        transaction,
      });

      await queryInterface.sequelize.query('DROP INDEX user_student_number', {
        transaction,
      });

      await queryInterface.sequelize.query(
        'DROP INDEX course_role_user_id_course_id',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP INDEX course_translation_course_id_language',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP INDEX task_grade_user_id_course_task_id',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
