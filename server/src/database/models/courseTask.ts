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

import {sequelize} from '..';
import CoursePart from './coursePart';

export default class CourseTask extends Model<
  InferAttributes<CourseTask>,
  InferCreationAttributes<CourseTask>
> {
  declare id: CreationOptional<number>;
  declare coursePartId: ForeignKey<CoursePart['id']>;
  declare name: string;
  // Default value, expiry date in grade takes precedence
  declare daysValid: number | null;
  declare maxGrade: number | null;
  declare archived: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseTask.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    daysValid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxGrade: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_task',
  }
);

CoursePart.hasMany(CourseTask, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
CourseTask.belongsTo(CoursePart, {foreignKey: 'coursePartId'});
