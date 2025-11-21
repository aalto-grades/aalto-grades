// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import type {QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

const mockDataDir = path.resolve(__dirname, '../../../../../mock-data/custom-data');
const readSql = (fileName: string): string | null => {
  const filePath = path.join(mockDataDir, fileName);
  if (!fs.existsSync(filePath)) {
    dbLogger.warn(`Seed file ${fileName} not found, skipping.`);
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
};

const users = readSql('user.sql');
const courses = readSql('course.sql');
const courseTranslation = readSql('course_translation.sql');
const courseRole = readSql('course_role.sql');
const coursePart = readSql('course_part.sql');
const gradingModel = readSql('grading_model.sql');
const courseTask = readSql('course_task.sql');
const taskGrade = readSql('task_grade.sql');
const finalGrade = readSql('final_grade.sql');
const aplusGradeSource = readSql('aplus_grade_source.sql');
const taskGradeLog = readSql('task_grade_log.sql');

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      if (users) await queryInterface.sequelize.query(users, {transaction});
      if (courses) await queryInterface.sequelize.query(courses, {transaction});
      if (courseTranslation) await queryInterface.sequelize.query(courseTranslation, {transaction});
      if (courseRole) await queryInterface.sequelize.query(courseRole, {transaction});
      if (coursePart) await queryInterface.sequelize.query(coursePart, {transaction});
      if (gradingModel) await queryInterface.sequelize.query(gradingModel, {transaction});
      if (courseTask) await queryInterface.sequelize.query(courseTask, {transaction});
      if (aplusGradeSource) await queryInterface.sequelize.query(aplusGradeSource, {transaction});
      if (taskGrade) await queryInterface.sequelize.query(taskGrade, {transaction});
      if (finalGrade) await queryInterface.sequelize.query(finalGrade, {transaction});
      if (taskGradeLog) await queryInterface.sequelize.query(taskGradeLog, {transaction});

      // Reset sequences to avoid collisions with subsequent seeders or manual inserts
      const tables = [
        'user',
        'course',
        'course_translation',
        'course_role',
        'course_part',
        'grading_model',
        'course_task',
        'task_grade',
        'final_grade',
        'aplus_grade_source',
        'task_grade_log'
      ];

      for (const table of tables) {
        // Use pg_get_serial_sequence to safely get the sequence name associated with the column
        await queryInterface.sequelize.query(
          `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE(max(id), 1)) FROM "${table}";`,
          {transaction}
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
      throw error;
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('task_grade_log', {}, {transaction});
      await queryInterface.bulkDelete('aplus_grade_source', {}, {transaction});
      await queryInterface.bulkDelete('final_grade', {}, {transaction});
      await queryInterface.bulkDelete('task_grade', {}, {transaction});
      await queryInterface.bulkDelete('course_task', {}, {transaction});
      await queryInterface.bulkDelete('grading_model', {}, {transaction});
      await queryInterface.bulkDelete('course_part', {}, {transaction});
      await queryInterface.bulkDelete('course_role', {}, {transaction});
      await queryInterface.bulkDelete('course_translation', {}, {transaction});
      await queryInterface.bulkDelete('course', {}, {transaction});
      await queryInterface.bulkDelete('user', {}, {transaction});

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
      throw error;
    }
  },
};
