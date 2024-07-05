// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // attainment -> course_part
      await queryInterface.renameTable('attainment', 'course_part', {
        transaction,
      });
      await queryInterface.sequelize.query(
        'ALTER SEQUENCE attainment_id_seq RENAME TO course_part_id_seq;',
        {transaction}
      );

      // rename constraint
      await queryInterface.removeConstraint(
        'course_part',
        'attainment_name_un',
        {transaction}
      );
      await queryInterface.addConstraint('course_part', {
        fields: ['course_id', 'name'],
        type: 'unique',
        name: 'course_part_name_un',
        transaction,
      });

      // Rename grade attainment id
      await queryInterface.renameColumn(
        'attainment_grade',
        'attainment_id',
        'course_part_id',
        {transaction}
      );

      // Rename index
      await queryInterface.removeIndex(
        'attainment_grade',
        ['user_id', 'attainment_id'],
        {transaction}
      );
      await queryInterface.addIndex(
        'attainment_grade',
        ['user_id', 'course_part_id'],
        {unique: false, transaction}
      );

      // Rename constraint
      await queryInterface.removeConstraint(
        'attainment_grade',
        'attainment_grade_attainment_id_fkey',
        {transaction}
      );
      await queryInterface.addConstraint('attainment_grade', {
        type: 'foreign key',
        fields: ['course_part_id'],
        name: 'attainment_grade_course_part_id_fkey',
        references: {table: 'course_part', field: 'id'},
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        transaction,
      });

      // Rename aplus grade source attainment id
      await queryInterface.renameColumn(
        'aplus_grade_source',
        'attainment_id',
        'course_part_id',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // course_part -> attainment
      await queryInterface.renameTable('course_part', 'attainment', {
        transaction,
      });
      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_part_id_seq RENAME TO attainment_id_seq;',
        {transaction}
      );

      // rename constraint
      await queryInterface.removeConstraint(
        'attainment',
        'course_part_name_un',
        {transaction}
      );
      await queryInterface.addConstraint('attainment', {
        fields: ['course_id', 'name'],
        type: 'unique',
        name: 'attainment_name_un',
        transaction,
      });

      // Rename grade course part id
      await queryInterface.renameColumn(
        'attainment_grade',
        'course_part_id',
        'attainment_id',
        {transaction}
      );

      // Rename index
      await queryInterface.removeIndex(
        'attainment_grade',
        ['user_id', 'course_part_id'],
        {transaction}
      );
      await queryInterface.addIndex(
        'attainment_grade',
        ['user_id', 'attainment_id'],
        {unique: false, transaction}
      );

      // Rename constraint
      await queryInterface.removeConstraint(
        'attainment_grade',
        'attainment_grade_course_part_id_fkey',
        {transaction}
      );
      await queryInterface.addConstraint('attainment_grade', {
        type: 'foreign key',
        fields: ['attainment_id'],
        name: 'attainment_grade_attainment_id_fkey',
        references: {table: 'attainment', field: 'id'},
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        transaction,
      });

      // Rename aplus grade source attainment id
      await queryInterface.renameColumn(
        'aplus_grade_source',
        'course_part_id',
        'attainment_id',
        {transaction}
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
