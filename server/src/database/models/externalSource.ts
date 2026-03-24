// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {
  type CreationOptional,
  DataTypes,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
} from 'sequelize';

import type {ExtServiceCourseData, ExternalSourceInfo} from '@/common/types';
import {sequelize} from '..';

export default class ExternalSource extends Model<
  InferAttributes<ExternalSource>,
  InferCreationAttributes<ExternalSource>
> {
  declare id: CreationOptional<number>;
  declare externalCourse: ExtServiceCourseData;
  declare externalServiceName: string;
  declare sourceInfo: ExternalSourceInfo;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ExternalSource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    externalCourse: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    externalServiceName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceInfo: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'external_source',
  }
);
