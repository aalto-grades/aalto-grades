import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '..';
import User from './user';
import CourseInstancePartialGrade from './courseInstancePartialGrade';

export default class UserPartialGrade extends Model<InferAttributes<UserPartialGrade>, InferCreationAttributes<UserPartialGrade>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseInstancePartialGradeId: ForeignKey<CourseInstancePartialGrade['id']>;
  declare points: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserPartialGrade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    points: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user_partial_grade'
  }
);
