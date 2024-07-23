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

import {AplusCourseData, AplusGradeSourceType} from '@/common/types';
import CoursePart from './coursePart';
import {sequelize} from '..';

export default class AplusGradeSource extends Model<
  InferAttributes<AplusGradeSource>,
  InferCreationAttributes<AplusGradeSource>
> {
  declare id: CreationOptional<number>;
  declare coursePartId: ForeignKey<CoursePart['id']>;
  declare aplusCourse: AplusCourseData; // TODO: Store as a table? Or individual fields?
  declare sourceType: AplusGradeSourceType;
  declare moduleId: CreationOptional<number | null>;
  declare moduleName: CreationOptional<string | null>;
  declare exerciseId: CreationOptional<number | null>;
  declare exerciseName: CreationOptional<string | null>;
  declare difficulty: CreationOptional<string | null>;
  declare date: Date | string;
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
    coursePartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_part',
        key: 'id',
      },
    },
    aplusCourse: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    sourceType: {
      type: DataTypes.ENUM('FULL_POINTS', 'MODULE', 'EXERCISE', 'DIFFICULTY'),
      allowNull: false,
    },
    moduleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    moduleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    exerciseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    exerciseName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'aplus_grade_source',
  }
);

CoursePart.hasMany(AplusGradeSource, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
AplusGradeSource.belongsTo(CoursePart, {foreignKey: 'coursePartId'});
