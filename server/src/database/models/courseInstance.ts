// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import Course from './course';
import User from './user';

export default class CourseInstance extends Model<
  InferAttributes<CourseInstance>,
  InferCreationAttributes<CourseInstance>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare gradingType: string;
  declare startingPeriod: string;
  declare endingPeriod: string;
  declare teachingMethod: string;
  declare responsibleTeacher: ForeignKey<User['id']>;
  declare minCredits: number;
  declare maxCredits: number;
  declare startDate: Date;
  declare endDate: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseInstance.init(
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
    gradingType: {
      type: DataTypes.ENUM('PASSFAIL', 'NUMERICAL'),
      allowNull: false
    },
    startingPeriod: {
      type: DataTypes.ENUM('I', 'II', 'III', 'IV', 'V'),
      allowNull: false
    },
    endingPeriod: {
      type: DataTypes.ENUM('I', 'II', 'III', 'IV', 'V'),
      allowNull: false
    },
    teachingMethod: {
      type: DataTypes.ENUM('LECTURE', 'EXAM'),
      allowNull: false
    },
    responsibleTeacher: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    minCredits: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    maxCredits: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startDate: {
      type: new DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
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
