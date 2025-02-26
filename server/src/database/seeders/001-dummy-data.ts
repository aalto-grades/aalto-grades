// SPDX-FileCopyrightText: 2022 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import type {QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

const mockDataDir = path.resolve(__dirname, '../../../../../mock-data');
const readSql = (fileName: string): string =>
  fs.readFileSync(path.join(mockDataDir, fileName), 'utf8');

const users = readSql('users.sql');
const courses = readSql('courses.sql');
const courseTranslation = readSql('course_translations.sql');
const courseRole = readSql('course_role.sql');
const coursePart = readSql('course_part.sql');
const gradingModel = readSql('grading_model.sql');
const courseTask = readSql('course_task.sql');
const taskGrade = readSql('task_grade.sql');
const finalGrade = readSql('final_grade.sql');

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(users, {transaction});
      await queryInterface.sequelize.query(courses, {transaction});
      await queryInterface.sequelize.query(courseTranslation, {transaction});
      await queryInterface.sequelize.query(courseRole, {transaction});
      await queryInterface.sequelize.query(coursePart, {transaction});
      await queryInterface.sequelize.query(gradingModel, {transaction});
      await queryInterface.sequelize.query(courseTask, {transaction});
      await queryInterface.sequelize.query(taskGrade, {transaction});
      await queryInterface.sequelize.query(finalGrade, {transaction});
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('final_grade', {}, {transaction});
      await queryInterface.bulkDelete('task_grade', {}, {transaction});
      await queryInterface.bulkDelete('course_task', {}, {transaction});
      await queryInterface.bulkDelete('grading_model', {}, {transaction});
      await queryInterface.bulkDelete('course_part', {}, {transaction});
      await queryInterface.bulkDelete('course_role', {}, {transaction});
      await queryInterface.bulkDelete('course_translation', {}, {transaction});
      await queryInterface.bulkDelete('course', {}, {transaction});
      await queryInterface.bulkDelete('user', {}, {transaction});

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE final_grade_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE task_grade_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_task_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE grading_model_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_part_id_seq RESTART;',
        {transaction}
      );

      // 'ALTER SEQUENCE' not needed for course_role

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_translation_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_id_seq RESTART;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE user_id_seq RESTART;',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
