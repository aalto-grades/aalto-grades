// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
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

import {sequelize} from '..';
import Course from './course';

export default class CourseTranslation extends Model<
  InferAttributes<CourseTranslation>,
  InferCreationAttributes<CourseTranslation>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare language: 'EN' | 'FI' | 'SV';
  declare courseName: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseTranslation.init(
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
    language: {
      type: new DataTypes.ENUM('EN', 'FI', 'SV'),
      allowNull: false,
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_translation',
  }
);

Course.hasMany(CourseTranslation, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CourseTranslation.belongsTo(Course, {foreignKey: 'courseId'});
