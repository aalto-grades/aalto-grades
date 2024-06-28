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

import AplusGradeSource from './aplusGradeSource';
import CoursePart from './coursePart';
import User from './user';
import {sequelize} from '..';

export default class AttainmentGrade extends Model<
  InferAttributes<AttainmentGrade>,
  InferCreationAttributes<AttainmentGrade>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare coursePartId: ForeignKey<CoursePart['id']>;
  declare graderId: ForeignKey<User['id']>;
  declare aplusGradeSourceId: CreationOptional<ForeignKey<
    AplusGradeSource['id']
  > | null>;
  declare grade: number;
  declare sisuExportDate: CreationOptional<Date | null>;
  // Date when course part is completed (e.g., deadline or exam date)
  declare date: Date | string; // Database outputs yyyy-mm-dd but inserting date is allowed
  declare expiryDate: Date | string; // Database outputs yyyy-mm-dd but inserting date is allowed
  declare comment: CreationOptional<string | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  grader?: User;
  User?: User;
  CoursePart?: CoursePart;
  AplusGradeSource?: AplusGradeSource;
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
    coursePartId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'course_part',
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
    aplusGradeSourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'aplus_grade_source',
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

CoursePart.hasMany(AttainmentGrade, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
AttainmentGrade.belongsTo(CoursePart, {foreignKey: 'coursePartId'});

User.hasMany(AttainmentGrade, {
  foreignKey: 'graderId',
  onDelete: 'NO ACTION',
  onUpdate: 'CASCADE',
});
AttainmentGrade.belongsTo(User, {foreignKey: 'graderId', as: 'grader'});

AplusGradeSource.hasMany(AttainmentGrade, {
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
AttainmentGrade.belongsTo(AplusGradeSource, {foreignKey: 'aplusGradeSourceId'});
