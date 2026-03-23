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
import {WaitListStatus} from '@/common/types';
import Course from './course';
import User from './user';

export default class WaitListEntry extends Model<
  InferAttributes<WaitListEntry>,
  InferCreationAttributes<WaitListEntry>
> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare userId: ForeignKey<User['id']>;
  declare reason: CreationOptional<string | null>;
  declare dateAdded: Date | string;
  declare dateResolved: CreationOptional<Date | string | null>;
  declare status: WaitListStatus;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  User?: User;
  Course?: Course;
}

WaitListEntry.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateAdded: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    dateResolved: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        WaitListStatus.Pending,
        WaitListStatus.Passed,
        WaitListStatus.Failed
      ),
      allowNull: false,
      defaultValue: WaitListStatus.Pending,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'wait_list_entry',
  }
);

Course.hasMany(WaitListEntry, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
WaitListEntry.belongsTo(Course, {foreignKey: 'courseId'});

User.hasMany(WaitListEntry, {onDelete: 'CASCADE', onUpdate: 'CASCADE'});
WaitListEntry.belongsTo(User, {foreignKey: 'userId'});
