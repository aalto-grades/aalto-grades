// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DateOnlyString} from '@common/types';
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
import Attainment from './attainment';
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
  declare sisuExportDate: CreationOptional<Date>;
  // Date when attainment is completed (e.g., deadline or exam date)
  declare date: CreationOptional<Date | DateOnlyString>;
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
    tableName: 'attainment_grade',
  }
);

FinalGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId',
});

User.hasMany(FinalGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

FinalGrade.belongsTo(User, {
  as: 'grader',
  targetKey: 'id',
  foreignKey: 'graderId',
});

User.hasMany(FinalGrade, {
  foreignKey: 'graderId',
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE',
});

FinalGrade.belongsTo(Attainment, {
  targetKey: 'id',
  foreignKey: 'attainmentId',
});

AssessmentModel.hasMany(FinalGrade, {
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE',
});
