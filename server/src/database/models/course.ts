// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import {GradingScale} from '@common/types';
import {sequelize} from '..';

export default class Course extends Model<
  InferAttributes<Course>,
  InferCreationAttributes<Course>
> {
  declare id: CreationOptional<number>;
  declare courseCode: string;
  declare languageOfInstruction: string;
  declare minCredits: number;
  declare maxCredits: number;
  declare gradingScale: GradingScale;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    courseCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    languageOfInstruction: {
      type: DataTypes.ENUM(
        'FI',
        'SV',
        'EN',
        'ES',
        'JA',
        'ZH',
        'PT',
        'FR',
        'DE',
        'RU'
      ),
      allowNull: false,
    },
    minCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxCredits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gradingScale: {
      type: DataTypes.ENUM(
        'PASS_FAIL',
        'NUMERICAL',
        'SECOND_NATIONAL_LANGUAGE'
      ),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course',
  }
);
