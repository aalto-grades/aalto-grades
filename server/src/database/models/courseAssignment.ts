// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import CourseInstancePartialGrade from './courseInstancePartialGrade';

export default class CourseAssignment extends Model<
  InferAttributes<CourseAssignment>,
  InferCreationAttributes<CourseAssignment>
> {
  declare id: CreationOptional<number>;
  declare courseInstancePartialGradeId: ForeignKey<CourseInstancePartialGrade['id']>;
  declare assignmentId: string;
  declare maxPoints: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    courseInstancePartialGradeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_instance_partial_grade',
        key: 'id'
      }
    },
    assignmentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maxPoints: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_assignment'
  }
);
