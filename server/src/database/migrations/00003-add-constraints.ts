// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {Op, QueryInterface} from 'sequelize';

import {sequelize} from '..';
import {dbLogger} from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addConstraint('course', {
        fields: ['min_credits'],
        type: 'check',
        name: 'course_min_credits_ck',
        where: {
          min_credits: {
            [Op.lte]: sequelize.col('max_credits'),
          },
        },
        transaction,
      });

      await queryInterface.addConstraint('assessment_model', {
        fields: ['course_id', 'name'],
        type: 'unique',
        name: 'course_assessment_model_name_un',
        transaction,
      });

      await queryInterface.addConstraint('attainment_grade', {
        fields: ['date'],
        type: 'check',
        name: 'attainment_grade_date_ck',
        where: {
          date: {
            [Op.lte]: sequelize.col('expiry_date'),
          },
        },
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeConstraint('course', 'course_min_credits_ck', {
        transaction,
      });

      await queryInterface.removeConstraint(
        'assessment_model',
        'course_assessment_model_name_un',
        {transaction}
      );

      await queryInterface.removeConstraint(
        'attainment_grade',
        'attainment_grade_date_ck',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
