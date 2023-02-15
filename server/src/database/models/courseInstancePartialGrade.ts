// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import Course from './course';
import CourseInstance from './courseInstance';

export default class CourseInstancePartialGrade extends Model<
  InferAttributes<CourseInstancePartialGrade>,
  InferCreationAttributes<CourseInstancePartialGrade>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare courseInstanceId: ForeignKey<CourseInstance['id']>;
  declare type: string;
  declare platform: string;
  declare maxPoints: number;
  declare minPoints: number;
  declare weight: number;
  declare expireAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseInstancePartialGrade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course',
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
    type: {
      type: DataTypes.ENUM('EXAM', 'EXERCISE', 'ATTENDANCE', 'FEEDBACK'),
      allowNull: false
    },
    platform: {
      type: DataTypes.ENUM('APLUS', 'MYCOURSES', 'OTHER'),
      allowNull: false
    },
    maxPoints: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    minPoints: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    expireAt: {
      type: new DataTypes.DATEONLY,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_instance'
  }
);
