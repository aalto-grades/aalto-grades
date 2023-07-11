// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import AssessmentModel from './assessmentModel';

import { Formula } from 'aalto-grades-common/types';

export default class Attainment extends Model<
  InferAttributes<Attainment>,
  InferCreationAttributes<Attainment>
> {
  declare id: CreationOptional<number>;
  declare assessmentModelId: ForeignKey<AssessmentModel['id']>;
  declare parentId: CreationOptional<ForeignKey<Attainment['id']>>;
  declare name: string;
  declare tag: string;
  // Default value, expiry date in AttainmentGrade takes precedence
  declare daysValid: number;
  declare formula: Formula;
  declare formulaParams: CreationOptional<object>;
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
    assessmentModelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment_model',
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
    daysValid: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    formula: {
      type: DataTypes.ENUM(Formula.Manual, Formula.WeightedAverage),
      allowNull: false,
      defaultValue: Formula.Manual,
    },
    formulaParams: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'attainment'
  }
);

Attainment.belongsTo(Attainment, {
  targetKey: 'id',
  foreignKey: 'parentId'
});

Attainment.hasMany(Attainment, {
  foreignKey: 'parentId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainment.belongsTo(AssessmentModel, {
  targetKey: 'id',
  foreignKey: 'assessmentModelId'
});

AssessmentModel.hasMany(Attainment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
