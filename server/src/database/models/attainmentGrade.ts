// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
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

import Attainment from './coursePart';
import User from './user';
import {sequelize} from '..';

export default class AttainmentGrade extends Model<
  InferAttributes<AttainmentGrade>,
  InferCreationAttributes<AttainmentGrade>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare attainmentId: ForeignKey<Attainment['id']>;
  declare graderId: ForeignKey<User['id']>;
  declare grade: number;
  declare sisuExportDate: CreationOptional<Date | null>;
  // Date when attainment is completed (e.g., deadline or exam date)
  declare date: Date | string; // Database outputs yyyy-mm-dd but inserting date is allowed
  declare expiryDate: Date | string; // Database outputs yyyy-mm-dd but inserting date is allowed
  declare comment: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  grader?: User;
  User?: User;
  Attainment?: Attainment;
}

AttainmentGrade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    attainmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'attainment',
        key: 'id',
      },
    },
    graderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    grade: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    sisuExportDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'attainment_grade',
  }
);

User.hasMany(AttainmentGrade, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
AttainmentGrade.belongsTo(User, {foreignKey: 'userId'});

Attainment.hasMany(AttainmentGrade, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
AttainmentGrade.belongsTo(Attainment, {foreignKey: 'attainmentId'});

User.hasMany(AttainmentGrade, {
  foreignKey: 'graderId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
AttainmentGrade.belongsTo(User, {foreignKey: 'graderId', as: 'grader'});
