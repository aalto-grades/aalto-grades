// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import Course from './course';
import CourseInstance from './courseInstance';

export default class Attainable extends Model<
  InferAttributes<Attainable>,
  InferCreationAttributes<Attainable>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare courseInstanceId: ForeignKey<CourseInstance['id']>;
  declare attainableId: CreationOptional<ForeignKey<Attainable['id']>>;
  declare name: string;
  declare executionDate: Date; // Date when assignment is done (e.g., deadline or exam date)
  declare expiryDate: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Attainable.init(
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
    attainableId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'attainable',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    executionDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'attainable'
  }
);
