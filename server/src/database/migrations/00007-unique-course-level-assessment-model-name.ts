// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {QueryInterface} from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      await queryInterface.addConstraint('assessment_model', {
        fields: ['course_id', 'name'],
        type: 'unique',
        name: 'course_assessment_model_name_ck',
      });
    } catch (error) {
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    try {
      await queryInterface.removeConstraint(
        'assessment_model',
        'course_assessment_model_name_ck'
      );
    } catch (error) {
      logger.error(error);
    }
  },
};
