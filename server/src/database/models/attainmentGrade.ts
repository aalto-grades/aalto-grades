// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional, DataTypes, ForeignKey, Model, InferAttributes, InferCreationAttributes
} from 'sequelize';

import { sequelize } from '..';
import Attainment from './attainment';
import User from './user';

export default class AttainmentGrade extends Model<
  InferAttributes<AttainmentGrade>,
  InferCreationAttributes<AttainmentGrade>
> {
  declare userId: ForeignKey<User['id']>;
  declare attainmentId: ForeignKey<Attainment['id']>;
  declare graderId: ForeignKey<User['id']>;
  declare grade: number;
  declare manual: boolean;
  declare date: Date; // Date when assignment is done (e.g., deadline or exam date)
  declare expiryDate: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AttainmentGrade.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    attainmentId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'attainment',
        key: 'id'
      }
    },
    graderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id'
      }
    },
    grade: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    manual: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'attainment_grade'
  }
);
