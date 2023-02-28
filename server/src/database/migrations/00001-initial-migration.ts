// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { DataTypes, QueryInterface, Transaction } from 'sequelize';

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
        student_id: {
          type: new DataTypes.STRING,
          unique: true,
          allowNull: true
        },
        name: {
          type: new DataTypes.STRING,
          allowNull: false
        },
        email: {
          type: new DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true
          }
        },
        password: {
          type: new DataTypes.CHAR(255),
          allowNull: false
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
        sisu_course_instance_id: {
          type: DataTypes.STRING,
          allowNull: true,
          unique: true
        },
        grading_type: {
          type: DataTypes.ENUM('PASSFAIL', 'NUMERICAL'),
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
        teaching_method: {
          type: DataTypes.ENUM('LECTURE', 'EXAM'),
          allowNull: false
        },
        responsible_teacher: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        min_credits: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        max_credits: {
          type: DataTypes.INTEGER,
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
      await queryInterface.createTable('course_role', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        course_instance_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'course_instance',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        role: {
          type: DataTypes.ENUM('STUDENT', 'ASSISTANT', 'TEACHER', 'SYSADMIN'),
          allowNull: false
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
      await queryInterface.createTable('attainable', {
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
        course_instance_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'course_instance',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        attainable_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'attainable',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        execution_date: {
          type: DataTypes.DATE,
          allowNull: false
        },
        expiry_date: {
          type: DataTypes.DATE,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });
      await queryInterface.createTable('user_attainable_grade', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        attainable_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'attainable',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        points: {
          type: DataTypes.FLOAT,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });
      await queryInterface.createTable('course_result', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'user',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        course_instance_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: 'course_instance',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        grade: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        credits: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('course_result', { transaction });
      await queryInterface.dropTable('user_attainable_grade', { transaction });
      await queryInterface.dropTable('attainable', { transaction });
      await queryInterface.dropTable('course_translation', { transaction });
      await queryInterface.dropTable('course_role', { transaction });
      await queryInterface.dropTable('course_instance', { transaction });
      await queryInterface.dropTable('course', { transaction });
      await queryInterface.dropTable('user', { transaction });
      await queryInterface.dropTable('migrations', { transaction });
      await queryInterface.dropTable('seeds', { transaction });

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_instance_grading_type;', { transaction }
      );

      await queryInterface.sequelize.query(
        'DROP TYPE IF EXISTS enum_course_role_role;', { transaction }
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

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  }
};
