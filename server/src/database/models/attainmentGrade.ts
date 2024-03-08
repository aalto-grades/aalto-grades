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
import Attainment from './attainment';
import User from './user';

export default class AttainmentGrade extends Model<
  InferAttributes<AttainmentGrade>,
  InferCreationAttributes<AttainmentGrade>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare attainmentId: ForeignKey<Attainment['id']>;
  declare graderId: ForeignKey<User['id']>;
  declare grade: number;
  declare sisuExportDate: CreationOptional<Date>;
  declare manual?: boolean;
  declare status?: string;
  // Date when attainment is completed (e.g., deadline or exam date)
  declare date: CreationOptional<Date | DateOnlyString>;
  declare expiryDate: CreationOptional<Date | DateOnlyString>;
  declare comment: CreationOptional<string>;
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
    // manual: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: true,
    // },
    // status: {
    //   type: DataTypes.ENUM('PASS', 'FAIL', 'PENDING'),
    //   allowNull: false,
    //   defaultValue: 'PENDING',
    // },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
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
    tableName: 'attainment_grade',
  }
);

AttainmentGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId',
});

User.hasMany(AttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

AttainmentGrade.belongsTo(User, {
  as: 'grader',
  targetKey: 'id',
  foreignKey: 'graderId',
});

User.hasMany(AttainmentGrade, {
  foreignKey: 'graderId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

AttainmentGrade.belongsTo(Attainment, {
  targetKey: 'id',
  foreignKey: 'attainmentId',
});

Attainment.hasMany(AttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
