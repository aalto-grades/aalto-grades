import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '..';
import User from './user';
import CourseAssignment from './courseAssignment';

export default class UserAssignmentGrade extends Model<InferAttributes<UserAssignmentGrade>, InferCreationAttributes<UserAssignmentGrade>> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseAssignmentId: ForeignKey<CourseAssignment['id']>;
  declare points: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

UserAssignmentGrade.init(
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
    tableName: 'user_assignment_grade'
  }
);
