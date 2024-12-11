// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
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

import type {ActionType} from '@/common/types';
import {sequelize} from '..';
import TaskGrade from './taskGrade';
import User from './user';

export default class TaskGradeLog extends Model<
  InferAttributes<TaskGradeLog>,
  InferCreationAttributes<TaskGradeLog>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare taskGradeId?: ForeignKey<TaskGrade['id']>;
  declare actionType: ActionType;
  declare updatedState?: TaskGrade;
  declare previousState?: TaskGrade;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

TaskGradeLog.init(
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
    taskGradeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'task_grade',
        key: 'id',
      },
    },
    actionType: {
      type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
      allowNull: false,
    },
    updatedState: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    previousState: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'task_grade_log',
  }
);

User.hasMany(TaskGradeLog, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
TaskGradeLog.belongsTo(User, {foreignKey: 'userId'});

TaskGrade.hasMany(TaskGradeLog, {onDelete: 'SET NULL', onUpdate: 'CASADE'});
TaskGradeLog.belongsTo(TaskGrade, {foreignKey: 'taskGradeId'});
