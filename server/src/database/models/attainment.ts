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

import Course from './course';
import {sequelize} from '..';

export default class Attainment extends Model<
  InferAttributes<Attainment>,
  InferCreationAttributes<Attainment>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare name: string;
  // Default value, expiry date in AttainmentGrade takes precedence
  declare daysValid: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Attainment.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    daysValid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 365,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'attainment',
  }
);

Course.hasMany(Attainment, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
Attainment.belongsTo(Course, {foreignKey: 'courseId'});
