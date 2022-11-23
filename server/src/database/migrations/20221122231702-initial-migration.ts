import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.createTable('user', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      student_id: {
        type: new DataTypes.STRING,
        unique: true,
        allowNull: false
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
        type: new DataTypes.CHAR(60),
        allowNull: false
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
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
        type: new DataTypes.INTEGER,
        allowNull: false
      },
      max_credits: {
        type: new DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE
    });
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
      grading_type: {
        type: DataTypes.ENUM('PASSFAIL', 'NUMERICAL'),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      start_date: {
        type: new DataTypes.DATE,
        allowNull: false
      },
      end_date: {
        type: new DataTypes.DATE,
        allowNull: false,
      },
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    });
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
    });
  },
  down: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('course_role');
    await queryInterface.dropTable('course_instance');
    await queryInterface.dropTable('course');
    await queryInterface.dropTable('user');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_course_instance_grading_type;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_course_role_role;');
  },
};
