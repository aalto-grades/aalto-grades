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

export default class Attainable extends Model<
  InferAttributes<Attainable>,
  InferCreationAttributes<Attainable>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare courseInstanceId: ForeignKey<CourseInstance['id']>;
  // TODO rename to parentId, atm sequelize forces name as "model + key" when querying.
  declare attainableId: CreationOptional<ForeignKey<Attainable['id']>>;
  declare name: string;
  declare formulaId: Formula;
  declare formulaParams: CreationOptional<object>;
  declare date: Date; // Date when assignment is done (e.g., deadline or exam date)
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
    formulaId: {
      type: DataTypes.ENUM(Formula.Manual, Formula.WeightedAverage),
      allowNull: false,
      defaultValue: Formula.Manual,
    },
    formulaParams: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
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
    tableName: 'attainable'
  }
);
