import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '..';
import CourseInstancePartialGrade from './courseInstancePartialGrade';

export default class CourseAssignment extends Model<InferAttributes<CourseAssignment>, InferCreationAttributes<CourseAssignment>> {
  declare id: CreationOptional<number>;
  declare courseInstanceId: ForeignKey<CourseInstancePartialGrade['id']>;
  declare assignmentId: string;
  declare maxPoints: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseAssignment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    assignmentId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    maxPoints: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_assignment'
  }
);
