import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize';
import { sequelize } from '..';
import Course from './course';

export default class CourseInstance extends Model<InferAttributes<CourseInstance>, InferCreationAttributes<CourseInstance>> {
  declare id: CreationOptional<number>;
  declare courseId: ForeignKey<Course['id']>;
  declare gradingType: string;
  declare name: string;
  declare startDate: Date;
  declare endDate: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

CourseInstance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    gradingType: {
      type: DataTypes.ENUM('PASSFAIL', 'NUMERICAL'),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startDate: {
      type: new DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: new DataTypes.DATE,
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
