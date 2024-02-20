// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DataTypes, QueryInterface} from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      // Change attainment possession from assess model to course
      await queryInterface.removeColumn('attainment', 'formula');
      await queryInterface.removeColumn('attainment', 'formula_params');
      await queryInterface.removeColumn('attainment', 'parent_id');
      await queryInterface.removeColumn('attainment', 'assessment_model_id');

      await queryInterface.addColumn('attainment', 'course_id', {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'course',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    } catch (error) {
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('assessment_model', 'graph_structure', {
        transaction,
      });
      await queryInterface.addColumn(
        'attainment',
        'formula',
        {type: DataTypes.STRING, allowNull: true},
        {transaction}
      );
      await queryInterface.addColumn(
        'attainment',
        'formula_params',
        {type: DataTypes.JSONB, allowNull: true},
        {transaction}
      );
      await queryInterface.addColumn(
        'attainment',
        'assessment_model_id',
        {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'assessment_model',
            key: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        {transaction}
      );
      await queryInterface.removeColumn('attainment', 'course_id', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      logger.error(error);
      await transaction.rollback();
    }
  },
};
