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
      await queryInterface.addColumn(
        'attainment',
        'archived',
        {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: true},
        {transaction}
      );
      await queryInterface.addColumn(
        'assessment_model',
        'archived',
        {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: true},
        {transaction}
      );

      // Convert attainment grade from cascade to restrict
      // Remove the old constraint
      await queryInterface.removeConstraint(
        'attainment_grade',
        'attainment_grade_attainment_id_fkey',
        {transaction}
      );

      // Add the new constraint
      await queryInterface.addConstraint('attainment_grade', {
        type: 'foreign key',
        fields: ['attainment_id'],
        name: 'attainment_grade_attainment_id_fkey',
        references: {table: 'attainment', field: 'id'},
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
      await queryInterface.removeColumn('attainment', 'archived', {
        transaction,
      });
      await queryInterface.removeColumn('assessment_model', 'archived', {
        transaction,
      });

      // Undo convert attainment grade from cascade to restrict
      // Remove the new constraint
      await queryInterface.removeConstraint(
        'attainment_grade',
        'attainment_grade_attainment_id_fkey',
        {transaction}
      );

      // Add the old constraint
      await queryInterface.addConstraint('attainment_grade', {
        type: 'foreign key',
        fields: ['attainment_id'],
        name: 'attainment_grade_attainment_id_fkey',
        references: {table: 'attainment', field: 'id'},
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
