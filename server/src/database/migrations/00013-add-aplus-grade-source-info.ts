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
        'aplus_grade_source',
        'aplus_course',
        {
          type: DataTypes.JSONB,
          defaultValue: {
            id: -1,
            courseCode: '',
            name: '',
            instance: '',
            url: '',
          },
          allowNull: false,
        },
        {transaction}
      );

      await queryInterface.addColumn(
        'aplus_grade_source',
        'module_name',
        {type: DataTypes.STRING, defaultValue: null, allowNull: true},
        {transaction}
      );

      await queryInterface.sequelize.query(
        `UPDATE aplus_grade_source
        SET aplus_course = jsonb_set(aplus_course, '{id}', to_jsonb(aplus_course_id))`,
        {transaction}
      );

      await queryInterface.removeColumn(
        'aplus_grade_source',
        'aplus_course_id',
        {transaction}
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
      await queryInterface.addColumn(
        'aplus_grade_source',
        'aplus_course_id',
        {type: DataTypes.INTEGER, defaultValue: -1, allowNull: false},
        {transaction}
      );

      await queryInterface.sequelize.query(
        `UPDATE aplus_grade_source
        SET aplus_course_id = (aplus_course->>'id')::int`,
        {transaction}
      );

      await queryInterface.removeColumn('aplus_grade_source', 'aplus_course', {
        transaction,
      });

      await queryInterface.removeColumn('aplus_grade_source', 'module_name', {
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
