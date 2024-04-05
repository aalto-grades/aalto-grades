// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {DataTypes, Deferrable, QueryInterface} from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      // Change attainment possession from assess model to course
      await queryInterface.removeColumn('attainment', 'formula');
      await queryInterface.removeColumn('attainment', 'formula_params');
      await queryInterface.removeColumn('attainment', 'parent_id');
      await queryInterface.removeColumn('attainment', 'assessment_model_id');
    } catch (error) {
      console.error(error);
    }
    try {
      await queryInterface.addColumn(
        'attainment',
        'course_id',
        {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'course',
            key: 'id',
            deferrable: new Deferrable.INITIALLY_DEFERRED(),
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
        },
        {}
      );
    } catch (error) {
      console.error(error);
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
      console.error(error);
      await transaction.rollback();
    }
  },
};
