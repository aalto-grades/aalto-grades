// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model
} from 'sequelize';

import { sequelize } from '..';

export default class Course extends Model<
  InferAttributes<Course>, InferCreationAttributes<Course>
> {
  declare id: CreationOptional<number>;
  declare courseCode: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    courseCode: {
      type: new DataTypes.STRING,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course'
  }
);
