import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '..';

export default class Course extends Model<InferAttributes<Course>, InferCreationAttributes<Course>> {
  declare id: CreationOptional<number>;
  declare courseCode: string;
  declare minCredits: number;
  declare maxCredits: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    courseCode: {
      type: new DataTypes.STRING,
      allowNull: false
    },
    minCredits: {
      type: new DataTypes.INTEGER,
      allowNull: false
    },
    maxCredits: {
      type: new DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course'
  }
);
