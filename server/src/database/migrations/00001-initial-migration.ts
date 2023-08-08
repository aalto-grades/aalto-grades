// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { DataTypes, QueryInterface, Transaction } from 'sequelize';

import logger from '../../configs/winston';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('user', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        student_number: {
          type: new DataTypes.STRING,
          unique: true,
          allowNull: true,
          defaultValue: null
        },
        name: {
          type: new DataTypes.STRING,
          allowNull: true,
          defaultValue: null
        },
        role: {
          type: DataTypes.ENUM('USER', 'ADMIN'),
          allowNull: false,
          defaultValue: 'USER'
        },
        email: {
          type: new DataTypes.STRING(255),
          allowNull: true,
          defaultValue: null,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        password: {
          type: new DataTypes.CHAR(255),
          allowNull: true,
          defaultValue: null
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.createTable('course', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        course_code: {
          type: new DataTypes.STRING,
          allowNull: false
        },
        min_credits: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        max_credits: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.createTable('assessment_model', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        course_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'course',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.createTable('attainment', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        assessment_model_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'assessment_model',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        parent_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'attainment',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        days_valid: {
          type: DataTypes.INTEGER,
          allowNull: true
        },
        formula: {
          type: DataTypes.ENUM('MANUAL', 'WEIGHTED_AVERAGE'),
          allowNull: false,
          defaultValue: 'MANUAL',
        },
        formula_params: {
          type: DataTypes.JSONB,
          allowNull: false,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.createTable('attainment_grade', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'user',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        attainment_id: {
          type: DataTypes.INTEGER,
          references: {
            model: 'attainment',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        grader_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        grade: {
          type: DataTypes.FLOAT,
          allowNull: false
        },
        manual: {
          type: DataTypes.BOOLEAN,
          allowNull: false
        },
        status: {
          type: DataTypes.ENUM('PASS', 'FAIL', 'PENDING'),
          allowNull: false,
          defaultValue: 'PENDING'
        },
        date: {
          type: DataTypes.DATE,
          allowNull: true
        },
        expiry_date: {
          type: DataTypes.DATE,
          allowNull: true
        },
        comment: {
          type: DataTypes.STRING,
          allowNull: true
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.createTable('course_instance', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        course_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'course',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        assessment_model_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'assessment_model',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        sisu_course_instance_id: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true
        },
        grading_scale: {
          type: DataTypes.ENUM('PASS_FAIL', 'NUMERICAL', 'SECOND_NATIONAL_LANGUAGE'),
          allowNull: false
        },
        starting_period: {
          type: DataTypes.ENUM('I', 'II', 'III', 'IV', 'V'),
          allowNull: false
        },
        ending_period: {
          type: DataTypes.ENUM('I', 'II', 'III', 'IV', 'V'),
          allowNull: false
        },
        type: {
          type: new DataTypes.STRING,
          allowNull: false
        },
        start_date: {
          type: new DataTypes.DATEONLY,
          allowNull: false
        },
        end_date: {
          type: new DataTypes.DATEONLY,
          allowNull: false,
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
      }, { transaction });

      await queryInterface.createTable('course_instance_role', {
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'user',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        course_instance_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'course_instance',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        role: {
          type: DataTypes.ENUM('STUDENT', 'TEACHER'),
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.createTable('teacher_in_charge', {
        user_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'user',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        course_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          references: {
            model: 'course',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.createTable('course_translation', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        course_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'course',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        language: {
          type: new DataTypes.ENUM('EN', 'FI', 'SV'),
          allowNull: false
        },
        department: {
          type: new DataTypes.STRING,
          allowNull: false,
        },
        course_name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('course_translation', { transaction });
      await queryInterface.dropTable('teacher_in_charge', { transaction });
      await queryInterface.dropTable('course_instance_role', { transaction });
      await queryInterface.dropTable('course_instance', { transaction });
      await queryInterface.dropTable('attainment_grade', { transaction });
      await queryInterface.dropTable('attainment', { transaction });
      await queryInterface.dropTable('assessment_model', { transaction });
      await queryInterface.dropTable('course', { transaction });
      await queryInterface.dropTable('user', { transaction });
      await queryInterface.dropTable('migrations', { transaction });
      await queryInterface.dropTable('seeds', { transaction });

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_instance_grading_scale;', { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_instance_role_role;', { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_instance_teaching_method;', { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_translation_language;', { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_instance_starting_period;', { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_instance_ending_period;', { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_attainment_formula;', { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_user_role;', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      logger.error(error);
    }
  }
};
