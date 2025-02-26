// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type CreationOptional,
  DataTypes,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from 'sequelize';

import type {GraphStructure} from '@/common/types';
import {sequelize} from '..';
import Course from './course';
import CoursePart from './coursePart';

export default class GradingModel extends Model<
  InferAttributes<GradingModel>,
  InferCreationAttributes<GradingModel>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare coursePartId: ForeignKey<CoursePart['id']> | null;
  declare name: string;
  declare graphStructure: GraphStructure;
  declare archived: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

GradingModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course',
        key: 'id',
      },
    },
    coursePartId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
      references: {
        model: 'course_part',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    graphStructure: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'grading_model',
  }
);

Course.hasMany(GradingModel, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
GradingModel.belongsTo(Course, {foreignKey: 'courseId'});

CoursePart.hasOne(GradingModel, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
GradingModel.belongsTo(CoursePart, {foreignKey: 'coursePartId'});
