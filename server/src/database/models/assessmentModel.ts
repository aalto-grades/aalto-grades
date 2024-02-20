// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

import {sequelize} from '..';
import Course from './course';

export default class AssessmentModel extends Model<
  InferAttributes<AssessmentModel>,
  InferCreationAttributes<AssessmentModel>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare name: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare graphStructure: JSON;
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
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'assessment_model',
  }
);

AssessmentModel.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId',
});

Course.hasMany(AssessmentModel, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
