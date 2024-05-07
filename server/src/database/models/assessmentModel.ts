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

import {GraphStructure} from '@common/types';
import {sequelize} from '..';
import Course from './course';

export default class AssessmentModel extends Model<
  InferAttributes<AssessmentModel>,
  InferCreationAttributes<AssessmentModel>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare name: string;
  declare graphStructure: GraphStructure;
  declare archived: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AssessmentModel.init(
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

Course.hasMany(AssessmentModel, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
AssessmentModel.belongsTo(Course, {foreignKey: 'courseId'});
