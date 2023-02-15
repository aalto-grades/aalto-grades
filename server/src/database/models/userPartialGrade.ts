// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import CourseInstancePartialGrade from './courseInstancePartialGrade';
import User from './user';

export default class UserPartialGrade extends Model<
  InferAttributes<UserPartialGrade>,
  InferCreationAttributes<UserPartialGrade>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseInstancePartialGradeId: ForeignKey<CourseInstancePartialGrade['id']>;
  declare points: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserPartialGrade.init(
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
    courseInstancePartialGradeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_instance_partial_grade',
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
    tableName: 'user_partial_grade'
  }
);
