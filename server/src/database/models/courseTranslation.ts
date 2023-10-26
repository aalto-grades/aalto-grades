// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
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

export default class CourseTranslation extends Model<
  InferAttributes<CourseTranslation>,
  InferCreationAttributes<CourseTranslation>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare language: string;
  declare department: string;
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
      type: new DataTypes.ENUM('EN', 'FI', 'SE'),
      allowNull: false,
    },
    department: {
      type: new DataTypes.STRING(),
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

CourseTranslation.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId',
});

Course.hasMany(CourseTranslation, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
