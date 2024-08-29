// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable camelcase */

import {DataTypes, type QueryInterface} from 'sequelize';

import {dbLogger} from '../../configs/winston';

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
          },
          student_number: {
            type: new DataTypes.STRING(),
            unique: true,
            allowNull: true,
          },
          name: {
            type: new DataTypes.STRING(),
            allowNull: true,
          },
          role: {
            type: DataTypes.ENUM('USER', 'ADMIN'),
            allowNull: false,
            defaultValue: 'USER',
          },
          email: {
            type: new DataTypes.STRING(255),
            allowNull: true,
            unique: true,
            validate: {
              isEmail: true,
            },
          },
          password: {
            type: new DataTypes.CHAR(255),
            allowNull: true,
          },
          force_password_reset: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          mfa_secret: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          mfa_confirmed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        'course_part',
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
          expiry_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
          },
          archived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'grading_model',
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
          course_part_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true,
            references: {
              model: 'course_part',
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
          archived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'course_task',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          course_part_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'course_part',
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
            allowNull: true,
          },
          max_grade: {
            type: DataTypes.FLOAT,
            allowNull: true,
          },
          archived: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'aplus_grade_source',
        {
          id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          course_task_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
              model: 'course_task',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          aplus_course: {
            type: DataTypes.JSONB,
            allowNull: false,
          },
          source_type: {
            type: DataTypes.ENUM(
              'FULL_POINTS',
              'MODULE',
              'EXERCISE',
              'DIFFICULTY'
            ),
            allowNull: false,
          },
          module_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          module_name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          exercise_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          exercise_name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          difficulty: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
        {transaction}
      );

      await queryInterface.createTable(
        'task_grade',
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
          course_task_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'course_task',
              key: 'id',
            },
            onDelete: 'RESTRICT',
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
          aplus_grade_source_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: 'aplus_grade_source',
              key: 'id',
            },
            onDelete: 'RESTRICT',
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
        'course_role',
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
          course_id: {
            type: DataTypes.INTEGER,
            references: {
              model: 'course',
              key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
          role: {
            type: DataTypes.ENUM('STUDENT', 'TEACHER', 'ASSISTANT'),
            allowNull: false,
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
            onDelete: 'RESTRICT',
            onUpdate: 'CASCADE',
          },
          grading_model_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
              model: 'grading_model',
              key: 'id',
            },
            onDelete: 'RESTRICT',
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
          comment: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          created_at: DataTypes.DATE,
          updated_at: DataTypes.DATE,
        },
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
      await queryInterface.dropTable('final_grade', {transaction});
      await queryInterface.dropTable('course_translation', {transaction});
      await queryInterface.dropTable('course_role', {transaction});
      await queryInterface.dropTable('task_grade', {transaction});
      await queryInterface.dropTable('aplus_grade_source', {transaction});
      await queryInterface.dropTable('course_task', {transaction});
      await queryInterface.dropTable('grading_model', {transaction});
      await queryInterface.dropTable('course_part', {transaction});
      await queryInterface.dropTable('course', {transaction});
      await queryInterface.dropTable('user', {transaction});

      await queryInterface.dropTable('migrations', {transaction});
      await queryInterface.dropTable('seeds', {transaction});

      await queryInterface.sequelize.query('DROP TYPE enum_user_role;', {
        transaction,
      });

      await queryInterface.sequelize.query(
        'DROP TYPE enum_course_language_of_instruction;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP TYPE enum_course_grading_scale;',
        {transaction}
      );

      await queryInterface.sequelize.query(
        'DROP TYPE enum_course_translation_language;',
        {transaction}
      );

      await queryInterface.sequelize.query('DROP TYPE enum_course_role_role;', {
        transaction,
      });

      await queryInterface.sequelize.query(
        'DROP TYPE enum_aplus_grade_source_source_type;',
        {transaction}
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      dbLogger.error(error);
    }
  },
};
