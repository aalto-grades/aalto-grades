import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '..';
import Course from './course';
import CourseInstance from './courseInstance';

export default class CourseInstancePartialGrade extends Model<InferAttributes<CourseInstancePartialGrade>, InferCreationAttributes<CourseInstancePartialGrade>> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare courseInstanceId: ForeignKey<CourseInstance['id']>;
  declare type: string;
  declare platform: string;
  declare maxPoints: number;
  declare minPoints: number;
  declare weight: number;
  declare expireAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseInstancePartialGrade.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('EXAM', 'EXERCISE', 'ATTENDANCE', 'FEEDBACK'),
      allowNull: false
    },
    platform: {
      type: DataTypes.ENUM('APLUS', 'MYCOURSES', 'OTHER'),
      allowNull: false
    },
    maxPoints: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    minPoints: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    expireAt: {
      type: new DataTypes.DATEONLY,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_instance'
  }
);
