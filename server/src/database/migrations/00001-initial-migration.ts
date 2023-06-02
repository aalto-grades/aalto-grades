// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { DataTypes, QueryInterface, Transaction } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    const transaction: Transaction = await queryInterface.sequelize.transaction();
    try {
      /*
       * Sequelize does not support composite foreign keys (as of the writing
       * of this comment), so raw queries are needed to add composite foreign
       * keys.
       *
       * Sequelize issue for composite foreign keys:
       * https://github.com/sequelize/sequelize/issues/311
       */

      await queryInterface.createTable('user', {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        student_id: {
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
          primaryKey: true,
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
        course_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        course_instance_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
        },
        role: {
          type: DataTypes.ENUM('STUDENT', 'TEACHER', 'TEACHER_IN_CHARGE'),
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.sequelize.query(
        'ALTER TABLE course_instance_role'
          + ' ADD FOREIGN KEY (course_id, course_instance_id)'
          + ' REFERENCES course_instance (course_id, id)'
          + ' ON DELETE CASCADE ON UPDATE CASCADE;',
        { transaction }
      );

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
          primaryKey: true,
        },
        course_instance_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        attainable_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
          // This might need a new table
          /*references: {
            model: 'attainable',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'*/
        },
        formula: {
          type: DataTypes.ENUM('MANUAL', 'WEIGHTED_AVERAGE'),
          allowNull: false,
          defaultValue: 'MANUAL',
        },
        parent_formula_params: {
          type: DataTypes.JSONB,
          allowNull: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false
        },
        date: {
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

      await queryInterface.sequelize.query(
        'ALTER TABLE attainable'
          + ' ADD FOREIGN KEY (course_id, course_instance_id)'
          + ' REFERENCES course_instance (course_id, id)'
          + ' ON DELETE CASCADE ON UPDATE CASCADE;',
        { transaction }
      );

      await queryInterface.createTable('user_attainment_grade', {
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
          primaryKey: true
        },
        course_instance_id: {
          type: DataTypes.INTEGER,
          primaryKey: true
        },
        attainable_id: {
          type: DataTypes.INTEGER,
          primaryKey: true
        },
        grade: {
          type: DataTypes.FLOAT,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.sequelize.query(
        'ALTER TABLE user_attainment_grade'
          + ' ADD FOREIGN KEY (course_id, course_instance_id, attainable_id)'
          + ' REFERENCES attainable (course_id, course_instance_id, id)'
          + ' ON DELETE CASCADE ON UPDATE CASCADE;',
        { transaction }
      );

      await queryInterface.createTable('course_result', {
        user_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
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
          allowNull: false,
          primaryKey: true
        },
        course_instance_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true
        },
        grade: {
          type: DataTypes.STRING,
          allowNull: false
        },
        credits: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE
      }, { transaction });

      await queryInterface.sequelize.query(
        'ALTER TABLE course_result'
          + ' ADD FOREIGN KEY (course_id, course_instance_id)'
          + ' REFERENCES course_instance (course_id, id)'
          + ' ON DELETE CASCADE ON UPDATE CASCADE;',
        { transaction }
      );

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
      await queryInterface.dropTable('user_attainment_grade', { transaction });
      await queryInterface.dropTable('attainable', { transaction });
      await queryInterface.dropTable('course_translation', { transaction });
      await queryInterface.dropTable('course_instance_role', { transaction });
      await queryInterface.dropTable('course_instance', { transaction });
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
        'DROP TYPE IF EXISTS enum_attainable_formula;', { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.log(error);
    }
  }
};
