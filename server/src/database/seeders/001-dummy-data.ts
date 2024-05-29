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
const courseRole = readSql('course_role.sql');
const courseTranslation = readSql('course_translations.sql');
const gradingModel = readSql('grading_model.sql');
const coursePart = readSql('course_part.sql');
const grade = readSql('attainment_grade.sql');
const finalGrade = readSql('final_grade.sql');

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(users, {transaction});
      await queryInterface.sequelize.query(courses, {transaction});
      await queryInterface.sequelize.query(gradingModel, {transaction});
      await queryInterface.sequelize.query(coursePart, {transaction});
      await queryInterface.sequelize.query(grade, {transaction});
      await queryInterface.sequelize.query(finalGrade, {transaction});
      await queryInterface.sequelize.query(courseTranslation, {transaction});
      await queryInterface.sequelize.query(courseRole, {transaction});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('course_role', {}, {transaction});
      await queryInterface.bulkDelete('course_translation', {}, {transaction});
      await queryInterface.bulkDelete('final_grade', {}, {transaction});
      await queryInterface.bulkDelete('attainment_grade', {}, {transaction});
      await queryInterface.bulkDelete('attainment', {}, {transaction});
      await queryInterface.bulkDelete('grading_model', {}, {transaction});
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
        'ALTER SEQUENCE grading_model_id_seq RESTART;',
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

      // 'ALTER SEQUENCE' not needed for course_role

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
