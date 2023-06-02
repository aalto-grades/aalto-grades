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
  declare userId: ForeignKey<User['id']>;
  declare courseId: ForeignKey<CourseInstance['courseId']>;
  declare courseInstanceId: ForeignKey<CourseInstance['id']>;
  declare role: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseInstanceRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'course_instance',
        key: 'course_id'
      }
    },
    courseInstanceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
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
