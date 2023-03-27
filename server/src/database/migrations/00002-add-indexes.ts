// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { QueryInterface, Transaction } from 'sequelize';

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
      await queryInterface.addIndex('user', ['student_id'], {
        unique: false,
        transaction
      });
      await queryInterface.addIndex('course_instance_role', ['user_id', 'course_instance_id'], {
        unique: true,
        transaction
      });
      await queryInterface.addIndex('course_translation', ['course_id', 'language'], {
        unique: true,
        transaction
      });
      await queryInterface.addIndex('attainable', ['id', 'course_id', 'course_instance_id'], {
        unique: true,
        transaction
      });
      await queryInterface.addIndex('attainable', ['attainable_id'], {
        unique: false,
        transaction
      });
      await queryInterface.addIndex('user_attainment_grade', ['user_id', 'attainable_id'], {
        unique: true,
        transaction
      });
      await queryInterface.addIndex('course_result', ['user_id', 'course_instance_id'], {
        unique: true,
        transaction
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
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
        'DROP INDEX IF EXISTS user_student_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_instance_role_user_id_course_instance_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_translation_course_id_language',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS attainable_id_course_id_course_instance_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS attainable_attainable_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS user_attainment_grade_user_id_attainable_id',
        { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP INDEX IF EXISTS course_result_user_id_course_instance_id',
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
};
