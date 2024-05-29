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

import {AplusGradeSourceType} from '@/common/types';
import Attainment from './coursePart';
import {sequelize} from '..';

export default class AplusGradeSource extends Model<
  InferAttributes<AplusGradeSource>,
  InferCreationAttributes<AplusGradeSource>
> {
  declare id: CreationOptional<number>;
  declare attainmentId: ForeignKey<Attainment['id']>;
  declare aplusCourseId: number;
  declare sourceType: AplusGradeSourceType;
  declare moduleId: CreationOptional<number | null>;
  declare difficulty: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AplusGradeSource.init(
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
    sourceType: {
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
    tableName: 'aplus_grade_source',
  }
);

Attainment.hasMany(AplusGradeSource, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
AplusGradeSource.belongsTo(Attainment, {foreignKey: 'attainmentId'});
