// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
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

import {AplusGradeSource} from '@common/types';
import {sequelize} from '..';
import Attainment from './attainment';

export default class AplusAttainment extends Model<
  InferAttributes<AplusAttainment>,
  InferCreationAttributes<AplusAttainment>
> {
  declare id: CreationOptional<number>;
  declare attainmentId: ForeignKey<Attainment['id']>;
  declare aplusCourseId: number;
  declare gradeSource: AplusGradeSource;
  declare moduleId: CreationOptional<number>;
  declare difficulty: CreationOptional<string>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AplusAttainment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    attainmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'attainment',
        key: 'id',
      },
    },
    aplusCourseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gradeSource: {
      type: DataTypes.ENUM('FULL_POINTS', 'MODULE', 'DIFFICULTY'),
      allowNull: false,
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'aplus_attainment',
  }
);

Attainment.hasMany(AplusAttainment, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
AplusAttainment.belongsTo(Attainment, {foreignKey: 'attainmentId'});
