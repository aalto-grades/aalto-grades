// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import CourseAssignment from './courseAssignment';
import User from './user';

export default class UserAssignmentGrade extends Model<
  InferAttributes<UserAssignmentGrade>,
  InferCreationAttributes<UserAssignmentGrade>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseAssignmentId: ForeignKey<CourseAssignment['id']>;
  declare points: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserAssignmentGrade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    courseAssignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_assignment',
        key: 'id'
      }
    },
    points: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user_assignment_grade'
  }
);
