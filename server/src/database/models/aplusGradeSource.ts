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

import type {AplusCourseData, AplusGradeSourceType} from '@/common/types';
import {sequelize} from '..';
import CourseTask from './courseTask';

export default class AplusGradeSource extends Model<
  InferAttributes<AplusGradeSource>,
  InferCreationAttributes<AplusGradeSource>
> {
  declare id: CreationOptional<number>;
  declare courseTaskId: ForeignKey<CourseTask['id']>;
  declare aplusCourse: AplusCourseData;
  declare date: Date | string;
  declare sourceType: AplusGradeSourceType;
  declare moduleId: CreationOptional<number | null>;
  declare moduleName: CreationOptional<string | null>;
  declare exerciseId: CreationOptional<number | null>;
  declare exerciseName: CreationOptional<string | null>;
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
    courseTaskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_task',
        key: 'id',
      },
    },
    aplusCourse: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'aplus_grade_source',
  }
);

CourseTask.hasMany(AplusGradeSource, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
AplusGradeSource.belongsTo(CourseTask, {foreignKey: 'courseTaskId'});
