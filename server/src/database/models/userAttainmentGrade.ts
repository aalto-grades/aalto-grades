// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import Attainable from './attainable';
import User from './user';

export default class UserAttainmentGrade extends Model<
  InferAttributes<UserAttainmentGrade>,
  InferCreationAttributes<UserAttainmentGrade>
> {
  declare userId: ForeignKey<User['id']>;
  declare attainableId: ForeignKey<Attainable['id']>;
  declare grade: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserAttainmentGrade.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    attainableId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'attainable',
        key: 'id'
      }
    },
    grade: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user_attainment_grade'
  }
);
