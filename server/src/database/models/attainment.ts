// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import { Formula } from '../../types/formulas';
import Course from './course';
import CourseInstance from './courseInstance';

export default class Attainment extends Model<
  InferAttributes<Attainment>,
  InferCreationAttributes<Attainment>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare courseInstanceId: ForeignKey<CourseInstance['id']>;
  declare parentId: CreationOptional<ForeignKey<Attainment['id']>>;
  declare name: string;
  declare tag: string;
  declare formula: Formula;
  declare parentFormulaParams: CreationOptional<object>;
  declare date: Date; // Date when assignment is done (e.g., deadline or exam date)
  declare expiryDate: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Attainment.init(
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
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'attainment',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tag: {
      type: DataTypes.STRING,
      allowNull: false
    },
    formula: {
      type: DataTypes.ENUM(Formula.Manual, Formula.WeightedAverage),
      allowNull: false,
      defaultValue: Formula.Manual,
    },
    parentFormulaParams: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    date: {
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
    tableName: 'attainment'
  }
);
