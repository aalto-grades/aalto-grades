// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { QueryInterface, Transaction } from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addIndex('course', [ 'course_code' ], {
        unique: false,
        transaction
      });

      await queryInterface.addIndex('course_instance', ['course_id'], {
        unique: false,
        transaction
      });

      await queryInterface.addIndex('user', ['student_number'], {
        unique: false,
        transaction
      });

      await queryInterface.addIndex('course_instance_role', ['user_id', 'course_instance_id'], {
        unique: true,
        transaction
      });

      await queryInterface.addIndex('teacher_in_charge', ['user_id', 'course_id'], {
        unique: true,
        transaction
      });

      await queryInterface.addIndex('course_translation', ['course_id', 'language'], {
        unique: true,
        transaction
      });

      await queryInterface.addIndex('attainment', ['parent_id'], {
        unique: false,
        transaction
      });

      await queryInterface.addIndex('attainment_grade', ['user_id', 'attainment_id'], {
        unique: false,
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_course_code',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_instance_course_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS user_student_number',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_instance_role_user_id_course_instance_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS teacher_in_charge_user_id_course_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_translation_course_id_language',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS attainment_parent_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS attainment_grade_user_id_attainment_id',
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
