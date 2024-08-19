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

      await queryInterface.addConstraint('course', {
        fields: ['course_code'],
        type: 'unique',
        name: 'course_course_code_un',
        transaction,
      });

      await queryInterface.addConstraint('grading_model', {
        fields: ['course_id', 'name'],
        type: 'unique',
        name: 'course_grading_model_name_un',
        transaction,
      });

      await queryInterface.addConstraint('course_part', {
        fields: ['course_id', 'name'],
        type: 'unique',
        name: 'course_course_part_name_un',
        transaction,
      });

      await queryInterface.addConstraint('course_task', {
        fields: ['course_part_id', 'name'],
        type: 'unique',
        name: 'course_part_course_task_name_un',
        transaction,
      });

      await queryInterface.addConstraint('task_grade', {
        fields: ['date'],
        type: 'check',
        name: 'task_grade_date_ck',
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

      await queryInterface.removeConstraint('course', 'course_course_code_un', {
        transaction,
      });

      await queryInterface.removeConstraint(
        'grading_model',
        'course_grading_model_name_un',
        {transaction}
      );

      await queryInterface.removeConstraint(
        'course_part',
        'course_course_part_name_un',
        {transaction}
      );

      await queryInterface.removeConstraint(
        'course_task',
        'course_part_course_task_name_un',
        {transaction}
      );

      await queryInterface.removeConstraint(
        'task_grade',
        'task_grade_date_ck',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
