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
      // assessment_model -> grading_model
      await queryInterface.renameTable('assessment_model', 'grading_model', {
        transaction,
      });
      await queryInterface.sequelize.query(
        'ALTER SEQUENCE assessment_model_id_seq RENAME TO grading_model_id_seq;',
        {transaction}
      );

      // rename constraint
      await queryInterface.removeConstraint(
        'grading_model',
        'course_assessment_model_name_un',
        {transaction}
      );
      await queryInterface.addConstraint('grading_model', {
        fields: ['course_id', 'name'],
        type: 'unique',
        name: 'course_grading_model_name_un',
        transaction,
      });

      // Rename final grade model id
      await queryInterface.renameColumn(
        'final_grade',
        'assessment_model_id',
        'grading_model_id',
        {transaction}
      );

      // Rename constraint
      await queryInterface.removeConstraint(
        'final_grade',
        'final_grade_assessment_model_id_fkey',
        {transaction}
      );
      await queryInterface.addConstraint('final_grade', {
        type: 'foreign key',
        fields: ['grading_model_id'],
        name: 'final_grade_grading_model_id_fkey',
        references: {table: 'grading_model', field: 'id'},
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
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // grading_model -> assessment_model
      await queryInterface.renameTable('grading_model', 'assessment_model', {
        transaction,
      });
      await queryInterface.sequelize.query(
        'ALTER SEQUENCE grading_model_id_seq RENAME TO assessment_model_id_seq;',
        {transaction}
      );

      // rename constraint
      await queryInterface.removeConstraint(
        'assessment_model',
        'course_grading_model_name_un',
        {transaction}
      );
      await queryInterface.addConstraint('assessment_model', {
        fields: ['course_id', 'name'],
        type: 'unique',
        name: 'course_assessment_model_name_un',
        transaction,
      });

      // Rename final grade model id
      await queryInterface.renameColumn(
        'final_grade',
        'grading_model_id',
        'assessment_model_id',
        {transaction}
      );

      // Rename constraint
      await queryInterface.removeConstraint(
        'final_grade',
        'final_grade_grading_model_id_fkey',
        {transaction}
      );
      await queryInterface.addConstraint('final_grade', {
        type: 'foreign key',
        fields: ['assessment_model_id'],
        name: 'final_grade_assessment_model_id_fkey',
        references: {table: 'assessment_model', field: 'id'},
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
