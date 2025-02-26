// SPDX-FileCopyrightText: 2022 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from 'sequelize';

import type {Department, GradingScale, Language} from '@/common/types';
import {sequelize} from '..';

export default class Course extends Model<
  InferAttributes<Course>,
  InferCreationAttributes<Course>
> {
  declare id: CreationOptional<number>;
  declare courseCode: string;
  declare department: Department;
  declare languageOfInstruction: Language;
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
    department: {
      type: DataTypes.ENUM(
        'ARCHITECTURE',
        'ART_AND_MEDIA',
        'DESIGN',
        'FILM',
        'ACCOUNTING_AND_BUSINESS_LAW',
        'ECONOMICS',
        'FINANCE',
        'MANAGEMENT_STUDIES',
        'MARKETING',
        'INFORMATION_AND_SERVICE_MANAGEMENT',
        'BIOPRODUCTS_AND_BIOSYSTEMS',
        'CHEMICAL_AND_METALLURGICAL_ENGINEERING',
        'CHEMISTRY_AND_MATERIALS_SCIENCE',
        'INFORMATION_AND_COMMUNICATIONS_ENGINEERING',
        'ELECTRONICS_AND_NANO_ENGINEERING',
        'ELECTRICAL_ENGINEERING_AND_AUTOMATION',
        'BUILT_ENVIRONMENT',
        'CIVIL_ENGINEERING',
        'MECHANICAL_ENGINEERING',
        'APPLIED_PHYSICS',
        'COMPUTER_SCIENCE',
        'INDUSTRIAL_ENGINEERING_AND_MANAGEMENT',
        'MATHEMATICS_AND_SYSTEMS_ANALYSIS',
        'NEUROSCIENCE_AND_BIOMEDICAL_ENGINEERING'
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
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course',
  }
);
