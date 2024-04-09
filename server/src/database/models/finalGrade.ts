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

import {sequelize} from '..';
import AssessmentModel from './assessmentModel';
import Course from './course';
import User from './user';

export default class FinalGrade extends Model<
  InferAttributes<FinalGrade>,
  InferCreationAttributes<FinalGrade>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseId: ForeignKey<Course['id']>;
  declare assessmentModelId: ForeignKey<AssessmentModel['id']>;
  declare graderId: ForeignKey<User['id']>;
  declare grade: number;
  declare sisuExportDate: Date | null;
  // Date when attainment is completed (e.g., deadline or exam date)
  declare date: CreationOptional<Date | string>; // Database outputs yyyy-mm-dd but inserting date is allowed
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  grader?: User;
  User?: User;
  Course?: Course;
  assessmentModel?: AssessmentModel;
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
    assessmentModelId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'assessment_model',
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

Course.hasMany(FinalGrade, {onDelete: 'NO ACTION', onUpdate: 'CASCADE'}); // TODO: Cascade ?
FinalGrade.belongsTo(Course, {foreignKey: 'courseId'});

AssessmentModel.hasMany(FinalGrade, {
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE',
});
FinalGrade.belongsTo(AssessmentModel, {foreignKey: 'assessmentModelId'});

User.hasMany(FinalGrade, {
  foreignKey: 'graderId',
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE',
});
FinalGrade.belongsTo(User, {foreignKey: 'graderId', as: 'grader'});
