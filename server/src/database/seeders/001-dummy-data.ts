// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import fs from 'fs';
import path from 'path';
import { QueryInterface, Transaction } from 'sequelize';

const users: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/users.sql'), 'utf8'
);

const courses: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/courses.sql'), 'utf8'
);

const courseInstances: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/course_instances.sql'), 'utf8'
);

const courseInstanceRoles: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/course_instance_roles.sql'), 'utf8'
);

const teachersInCharge: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/teachers_in_charge.sql'), 'utf8'
);

const courseTranslation: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/course_translations.sql'), 'utf8'
);

const assessmentModel: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/assessment_model.sql'), 'utf8'
);

const attainment: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/attainment.sql'), 'utf8'
);

const attainmentGrade: string = fs.readFileSync(
  path.resolve(__dirname, '../../../../mock-data/attainment_grade.sql'), 'utf8'
);

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.sequelize.query(users, { transaction });
      await queryInterface.sequelize.query(courses, { transaction });
      await queryInterface.sequelize.query(assessmentModel, { transaction });
      await queryInterface.sequelize.query(attainment, { transaction });
      await queryInterface.sequelize.query(attainmentGrade, { transaction });
      await queryInterface.sequelize.query(courseTranslation, { transaction });
      await queryInterface.sequelize.query(courseInstances, { transaction });
      await queryInterface.sequelize.query(courseInstanceRoles, { transaction });
      await queryInterface.sequelize.query(teachersInCharge, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('teacher_in_charge', {}, { transaction });
      await queryInterface.bulkDelete('course_instance_role', {}, { transaction });
      await queryInterface.bulkDelete('course_instance', {}, { transaction });
      await queryInterface.bulkDelete('course_translation', {}, { transaction });
      await queryInterface.bulkDelete('attainment_grade', {}, { transaction });
      await queryInterface.bulkDelete('attainment', {}, { transaction });
      await queryInterface.bulkDelete('assessment_model', {}, { transaction });
      await queryInterface.bulkDelete('course', {}, { transaction });
      await queryInterface.bulkDelete('user', {}, { transaction });

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE assessment_model_id_seq RESTART;', { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE attainment_id_seq RESTART;', { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_instance_id_seq RESTART;', { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_translation_id_seq RESTART;', { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE course_id_seq RESTART;', { transaction }
      );

      await queryInterface.sequelize.query(
        'ALTER SEQUENCE user_id_seq RESTART;', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
};
