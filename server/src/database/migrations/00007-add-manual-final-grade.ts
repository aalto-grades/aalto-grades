// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {DataTypes, QueryInterface} from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'final_grade',
        'assessment_model_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true, // Change allowNull to true
        },
        {transaction}
      );

      // Convert course id from no action to restrict
      // Remove the old constraint
      await queryInterface.removeConstraint(
        'final_grade',
        'final_grade_course_id_fkey',
        {transaction}
      );
      // Add the new constraint
      await queryInterface.addConstraint('final_grade', {
        type: 'foreign key',
        fields: ['course_id'],
        name: 'final_grade_course_id_fkey',
        references: {table: 'course', field: 'id'},
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        transaction,
      });

      // Convert assessment model id from cascade to restrict
      // Remove the old constraint
      await queryInterface.removeConstraint(
        'final_grade',
        'final_grade_assessment_model_id_fkey',
        {transaction}
      );
      // Add the new constraint
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
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        'final_grade',
        'assessment_model_id',
        {
          type: DataTypes.INTEGER,
          allowNull: false, // Undo change allowNull to true
        },
        {transaction}
      );

      // Undo convert course id from no action to restrict
      // Remove the new constraint
      await queryInterface.removeConstraint(
        'final_grade',
        'final_grade_course_id_fkey',
        {transaction}
      );
      // Add the old constraint
      await queryInterface.addConstraint('final_grade', {
        type: 'foreign key',
        fields: ['course_id'],
        name: 'final_grade_course_id_fkey',
        references: {table: 'course', field: 'id'},
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
        transaction,
      });

      // Undo convert assessment model id from cascade to restrict
      // Remove the new constraint
      await queryInterface.removeConstraint(
        'final_grade',
        'final_grade_assessment_model_id_fkey',
        {transaction}
      );
      // Add the old constraint
      await queryInterface.addConstraint('final_grade', {
        type: 'foreign key',
        fields: ['assessment_model_id'],
        name: 'final_grade_assessment_model_id_fkey',
        references: {table: 'assessment_model', field: 'id'},
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
