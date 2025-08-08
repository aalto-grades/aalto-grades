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
import Course from './course';
import GradingModel from './gradingModel';
import User from './user';

export default class FinalGrade extends Model<
  InferAttributes<FinalGrade>,
  InferCreationAttributes<FinalGrade>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseId: ForeignKey<Course['id']>;
  declare gradingModelId: CreationOptional<ForeignKey<
    GradingModel['id']
  > | null>;

  declare graderId: ForeignKey<User['id']>;
  declare grade: number;
  // Date when grade part is completed (e.g., deadline or exam date)
  declare date: Date | string; // Database outputs yyyy-mm-dd but inserting date is allowed
  declare sisuExportDate: CreationOptional<Date | null>;
  declare comment: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  grader?: User;
  User?: User;
  Course?: Course;
  gradingModel?: GradingModel;
}

FinalGrade.init(
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
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course',
        key: 'id',
      },
    },
    gradingModelId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'grading_model',
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
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    sisuExportDate: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: 'final_grade',
  }
);

User.hasMany(FinalGrade, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
FinalGrade.belongsTo(User, {foreignKey: 'userId'});

Course.hasMany(FinalGrade, {onDelete: 'RESTRICT', onUpdate: 'CASCADE'});
FinalGrade.belongsTo(Course, {foreignKey: 'courseId'});

GradingModel.hasMany(FinalGrade, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
FinalGrade.belongsTo(GradingModel, {foreignKey: 'gradingModelId'});

User.hasMany(FinalGrade, {
  foreignKey: 'graderId',
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE',
});
FinalGrade.belongsTo(User, {foreignKey: 'graderId', as: 'grader'});
