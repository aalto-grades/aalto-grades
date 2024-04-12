// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import {QueryInterface} from 'sequelize';

import logger from '../../configs/winston';

const mockDataDir = path.resolve(__dirname, '../../../../../mock-data');
const readSql = (fileName: string): string =>
  fs.readFileSync(path.join(mockDataDir, fileName), 'utf8');

const users = readSql('users.sql');
const courses = readSql('courses.sql');
const teachersInCharge = readSql('teachers_in_charge.sql');
const courseTranslation = readSql('course_translations.sql');
const assessmentModel = readSql('assessment_model.sql');
const attainment = readSql('attainment.sql');
const attainmentGrade = readSql('attainment_grade.sql');
const finalGrade = readSql('final_grade.sql');

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(users, {transaction});
      await queryInterface.sequelize.query(courses, {transaction});
      await queryInterface.sequelize.query(assessmentModel, {transaction});
      await queryInterface.sequelize.query(attainment, {transaction});
      await queryInterface.sequelize.query(attainmentGrade, {transaction});
      await queryInterface.sequelize.query(finalGrade, {transaction});
      await queryInterface.sequelize.query(courseTranslation, {transaction});
      await queryInterface.sequelize.query(teachersInCharge, {transaction});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('teacher_in_charge', {}, {transaction});
      await queryInterface.bulkDelete('course_translation', {}, {transaction});
      await queryInterface.bulkDelete('final_grade', {}, {transaction});
      await queryInterface.bulkDelete('attainment_grade', {}, {transaction});
      await queryInterface.bulkDelete('attainment', {}, {transaction});
      await queryInterface.bulkDelete('assessment_model', {}, {transaction});
      await queryInterface.bulkDelete('course', {}, {transaction});
      await queryInterface.bulkDelete('user', {}, {transaction});

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE user_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE assessment_model_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE attainment_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE attainment_grade_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE final_grade_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_translation_id_seq RESTART;',
        {transaction}
      );

      // 'ALTER SEQUENCE' not needed for teacher_in_charge

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
