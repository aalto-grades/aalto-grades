// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable camelcase */

import {DataTypes, type QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

const department = DataTypes.ENUM(
  'ARCHITECTURE',
  'ART_AND_MEDIA',
  'DESIGN',
  'FILM',
  'ACCOUNTING_AND_BUSINESS_LAW',
  'ECONOMICS',
  'FINANCE',
  'MANAGEMENT_STUDIES',
  'MARKETING',
  'INFORMATION_AND_SERVICE_MANAGEMENT',
  'BIOPRODUCTS_AND_BIOSYSTEMS',
  'CHEMICAL_AND_METALLURGICAL_ENGINEERING',
  'CHEMISTRY_AND_MATERIALS_SCIENCE',
  'INFORMATION_AND_COMMUNICATIONS_ENGINEERING',
  'ELECTRONICS_AND_NANO_ENGINEERING',
  'ELECTRICAL_ENGINEERING_AND_AUTOMATION',
  'BUILT_ENVIRONMENT',
  'CIVIL_ENGINEERING',
  'MECHANICAL_ENGINEERING',
  'APPLIED_PHYSICS',
  'COMPUTER_SCIENCE',
  'INDUSTRIAL_ENGINEERING_AND_MANAGEMENT',
  'MATHEMATICS_AND_SYSTEMS_ANALYSIS',
  'NEUROSCIENCE_AND_BIOMEDICAL_ENGINEERING'
);

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Add column without null constraint
      await queryInterface.addColumn(
        'course',
        'department',
        {
          type: department,
          allowNull: true,
        },
        {transaction}
      );

      // Default everything to computer science
      await queryInterface.sequelize.query(
        "UPDATE course SET department = 'COMPUTER_SCIENCE'",
        {transaction}
      );

      // Add null constraint
      await queryInterface.changeColumn(
        'course',
        'department',
        {
          type: department,
          allowNull: false,
        },
        {transaction}
      );

      await queryInterface.removeColumn('course_translation', 'department', {
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
      await queryInterface.removeColumn('course', 'department', {transaction});

      // Add column without null constraint
      await queryInterface.addColumn(
        'course_translation',
        'department',
        {
          type: DataTypes.STRING,
          allowNull: true,
        },
        {transaction}
      );

      // Default everything to computer science
      await queryInterface.sequelize.query(
        "UPDATE course_translation SET department = 'Department of Computer Science' WHERE language = 'EN'",
        {transaction}
      );
      await queryInterface.sequelize.query(
        "UPDATE course_translation SET department = 'Tietotekniikan laitos' WHERE language = 'FI'",
        {transaction}
      );
      await queryInterface.sequelize.query(
        "UPDATE course_translation SET department = 'Institutionen för datateknik' WHERE language = 'SV'",
        {transaction}
      );

      // Add null constraint
      await queryInterface.changeColumn(
        'course_translation',
        'department',
        {
          type: DataTypes.STRING,
          allowNull: false,
        },
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
