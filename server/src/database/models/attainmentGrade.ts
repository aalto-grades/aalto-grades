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
  declare status: string;
  // Date when attainment is completed (e.g., deadline or exam date)
  declare date: CreationOptional<Date>;
  declare expiryDate: CreationOptional<Date>;
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
    status: {
      type: DataTypes.ENUM('PASS', 'FAIL'),
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'attainment_grade'
  }
);

AttainmentGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId'
});

User.hasMany(AttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AttainmentGrade.belongsTo(User, {
  as: 'grader',
  targetKey: 'id',
  foreignKey: 'graderId'
});

User.hasMany(AttainmentGrade, {
  foreignKey: 'graderId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AttainmentGrade.belongsTo(Attainment, {
  targetKey: 'id',
  foreignKey: 'attainmentId'
});

Attainment.hasMany(AttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
