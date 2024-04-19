// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint camelcase: off */

import {DataTypes, QueryInterface} from 'sequelize';
import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'user',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          edu_user: {
            type: new DataTypes.STRING(),
            unique: true,
            allowNull: true,
            defaultValue: null,
          },
          student_number: {
            type: new DataTypes.STRING(),
            unique: true,
            allowNull: true,
            defaultValue: null,
          },
          name: {
            type: new DataTypes.STRING(),
            allowNull: true,
            defaultValue: null,
          },
          role: {
            type: DataTypes.ENUM('USER', 'ADMIN'),
            allowNull: false,
            defaultValue: 'USER',
          },
          email: {
            type: new DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null,
            unique: true,
            validate: {
              isEmail: true,
            },
          },
          password: {
            type: new DataTypes.CHAR(255),
            allowNull: true,
            defaultValue: null,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'course',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          course_code: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          language_of_instruction: {
            type: DataTypes.ENUM(
              'FI',
              'SV',
              'EN',
              'ES',
              'JA',
              'ZH',
              'PT',
              'FR',
              'DE',
              'RU'
            ),
            allowNull: false,
          },
          min_credits: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          max_credits: {
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          grading_scale: {
            type: DataTypes.ENUM(
              'PASS_FAIL',
              'NUMERICAL',
              'SECOND_NATIONAL_LANGUAGE'
            ),
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'assessment_model',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          graph_structure: {
            type: DataTypes.JSONB,
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'attainment',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          days_valid: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 365,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'attainment_grade',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          attainment_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'attainment',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          grader_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          grade: {
            type: DataTypes.FLOAT,
            allowNull: false,
          },
          sisu_export_date: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
          },
          expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
          },
          comment: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'teacher_in_charge',
        {
          user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          course_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'course_translation',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          language: {
            type: new DataTypes.ENUM('EN', 'FI', 'SV'),
            allowNull: false,
          },
          department: {
            type: new DataTypes.STRING(),
            allowNull: false,
          },
          course_name: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'final_grade',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          course_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'NO ACTION', // TODO: Cascade ?
            onUpdate: 'CASCADE',
          },
          assessment_model_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'assessment_model',
              key: 'id',
            },
            onDelete: 'NO ACTION',
            onUpdate: 'CASCADE',
          },
          grader_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'user',
              key: 'id',
            },
            onDelete: 'NO ACTION',
            onUpdate: 'CASCADE',
          },
          date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
          },
          grade: {
            type: DataTypes.FLOAT,
            allowNull: false,
          },
          sisu_export_date: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
          },
        },
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('final_grade', {transaction});
      await queryInterface.dropTable('course_translation', {transaction});
      await queryInterface.dropTable('teacher_in_charge', {transaction});
      await queryInterface.dropTable('attainment_grade', {transaction});
      await queryInterface.dropTable('attainment', {transaction});
      await queryInterface.dropTable('assessment_model', {transaction});
      await queryInterface.dropTable('course', {transaction});
      await queryInterface.dropTable('user', {transaction});

      await queryInterface.dropTable('migrations', {transaction});
      await queryInterface.dropTable('seeds', {transaction});

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_user_role;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_language_of_instruction;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_grading_scale;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_translation_language;',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
};
