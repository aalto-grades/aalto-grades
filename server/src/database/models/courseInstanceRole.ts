// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import CourseInstance from './courseInstance';
import User from './user';

export default class CourseInstanceRole extends Model<
  InferAttributes<CourseInstanceRole>,
  InferCreationAttributes<CourseInstanceRole>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseInstanceId: ForeignKey<CourseInstance['id']>;
  declare role: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseInstanceRole.init(
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
    courseInstanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_instance',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('STUDENT', 'TEACHER', 'TEACHER_IN_CHARGE'),
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_instance_role'
  }
);
