// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type CreationOptional,
  DataTypes,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from 'sequelize';

import AplusGradeSource from './aplusGradeSource';
import CourseTask from './courseTask';
import User from './user';
import {sequelize} from '..';

export default class TaskGrade extends Model<
  InferAttributes<TaskGrade>,
  InferCreationAttributes<TaskGrade>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseTaskId: ForeignKey<CourseTask['id']>;
  declare graderId: ForeignKey<User['id']>;
  declare aplusGradeSourceId: CreationOptional<ForeignKey<
    AplusGradeSource['id']
  > | null>;
  declare grade: number;
  declare sisuExportDate: CreationOptional<Date | null>;
  // Date when course part is completed (e.g., deadline or exam date)
  declare date: Date | string | null; // Database outputs 'yyyy-mm-dd' but inserting date is allowed
  declare expiryDate: Date | string | null; // Database outputs 'yyyy-mm-dd' but inserting date is allowed
  declare comment: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  grader?: User;
  User?: User;
  CourseTask?: CourseTask;
  AplusGradeSource?: AplusGradeSource;
}

TaskGrade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    courseTaskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_part',
        key: 'id',
      },
    },
    graderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    aplusGradeSourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'aplus_grade_source',
        key: 'id',
      },
    },
    grade: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    sisuExportDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'task_grade',
  }
);

User.hasMany(TaskGrade, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
TaskGrade.belongsTo(User, {foreignKey: 'userId'});

CourseTask.hasMany(TaskGrade, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
TaskGrade.belongsTo(CourseTask, {foreignKey: 'courseTaskId'});

User.hasMany(TaskGrade, {
  foreignKey: 'graderId',
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE',
});
TaskGrade.belongsTo(User, {foreignKey: 'graderId', as: 'grader'});

AplusGradeSource.hasMany(TaskGrade, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
TaskGrade.belongsTo(AplusGradeSource, {foreignKey: 'aplusGradeSourceId'});
