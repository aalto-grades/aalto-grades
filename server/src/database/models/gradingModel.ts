// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import {GraphStructure} from '@/common/types';
import Course from './course';
import {sequelize} from '..';

export default class GradingModel extends Model<
  InferAttributes<GradingModel>,
  InferCreationAttributes<GradingModel>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
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
    tableName: 'assessment_model',
  }
);

Course.hasMany(GradingModel, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
GradingModel.belongsTo(Course, {foreignKey: 'courseId'});
