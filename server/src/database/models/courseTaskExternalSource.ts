// SPDX-FileCopyrightText: 2026 The Ossi Developers
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
import CourseTask from './courseTask';
import ExternalSource from './externalSource';

export default class CourseTaskExternalSource extends Model<
  InferAttributes<CourseTaskExternalSource>,
  InferCreationAttributes<CourseTaskExternalSource>
> {
  declare id: CreationOptional<number>;
  declare courseTaskId: ForeignKey<CourseTask['id']>;
  declare externalSourceId: ForeignKey<ExternalSource['id']>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseTaskExternalSource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    courseTaskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'course_task',
        key: 'id',
      },
    },
    externalSourceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'external_source',
        key: 'id',
      },
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_task_external_source',
  }
);

CourseTask.hasMany(CourseTaskExternalSource, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
CourseTaskExternalSource.belongsTo(CourseTask, {
  foreignKey: 'courseTaskId',
});

ExternalSource.hasMany(CourseTaskExternalSource, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
CourseTaskExternalSource.belongsTo(ExternalSource, {
  foreignKey: 'externalSourceId',
});

CourseTask.belongsToMany(ExternalSource, {
  through: CourseTaskExternalSource,
  foreignKey: 'courseTaskId',
  otherKey: 'externalSourceId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

ExternalSource.belongsToMany(CourseTask, {
  through: CourseTaskExternalSource,
  foreignKey: 'externalSourceId',
  otherKey: 'courseTaskId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
