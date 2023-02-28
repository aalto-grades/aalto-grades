// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { QueryInterface, Transaction, Op } from 'sequelize';

import { sequelize } from '..';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addConstraint('course_instance', {
        fields: ['min_credits'],
        type: 'check',
        where: {
          min_credits: {
            [Op.lte]: sequelize.col('max_credits')
          }
        },
        transaction
      });
      await queryInterface.addConstraint('course_instance', {
        fields: ['start_date'],
        type: 'check',
        where: {
          start_date: {
            [Op.lte]: sequelize.col('end_date')
          }
        },
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
      await queryInterface.removeConstraint(
        'course_instance',
        'course_instance_min_credits_ck',
        { transaction }
      );

      await queryInterface.removeConstraint(
        'course_instance',
        'course_instance_start_date_ck',
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
};
