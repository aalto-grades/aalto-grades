// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { QueryInterface, Transaction } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addIndex('course_instance', ['course_id'], {
        unique: false,
        transaction
      });
      await queryInterface.addIndex('course_role', ['user_id', 'course_instance_id'], {
        unique: true,
        transaction
      });
      await queryInterface.addIndex('course_translation', ['course_id', 'language'], {
        unique: true,
        transaction
      });
      await queryInterface.addIndex('course_instance_partial_grade', ['course_id', 'course_instance_id'], {
        unique: false,
        transaction
      });
      await queryInterface.addIndex('user_partial_grade', ['user_id', 'course_instance_partial_grade_id'], {
        unique: true,
        transaction
      });
      await queryInterface.addIndex('course_assignment', ['course_instance_partial_grade_id'], {
        unique: false,
        transaction
      });
      await queryInterface.addIndex('user_assignment_grade', ['user_id', 'course_assignment_id'], {
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
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_instance_course_id', { transaction });
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_role_user_id_course_instance_id', { transaction });
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_translation_course_id_language', { transaction });
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_instance_partial_grade_course_id_course_instance_id', { transaction });
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS user_partial_grade_user_id_course_instance_partial_grade_id', { transaction });
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_assignment_course_instance_partial_grade_id', { transaction });
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS user_assignment_grade_user_id_course_assignment_id', { transaction });
      await queryInterface.sequelize.query('DROP INDEX IF EXISTS course_result_user_id_course_instance_id', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
};
