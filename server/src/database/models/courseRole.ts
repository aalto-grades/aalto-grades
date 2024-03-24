// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CreationOptional,
  DataTypes,
  ForeignKey,
  Model,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';

import {sequelize} from '..';
import Course from './course';
import User from './user';
import {CourseRoleType} from '@common/types';

export default class CourseRole extends Model<
  InferAttributes<CourseRole>,
  InferCreationAttributes<CourseRole>
> {
  declare userId: ForeignKey<User['id']>;
  declare courseId: ForeignKey<Course['id']>;
  declare role: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  static updateCourseAssistants: (
    assistants: Array<User>,
    courseId: number
  ) => Promise<void>;
}

CourseRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    courseId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'course',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('STUDENT', 'TEACHER', 'ASSISTANT'),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'course_role',
  }
);

User.belongsToMany(Course, {
  through: CourseRole,
  as: 'hasCourse',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Course.belongsToMany(User, {
  through: CourseRole,
  as: 'inCourse',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

CourseRole.updateCourseAssistants = async function (
  assistants: Array<User>,
  courseId: number
): Promise<void> {
  const oldAssistants: Array<CourseRole> = await CourseRole.findAll({
    where: {
      courseId: courseId,
    },
  });
  for (const oldAssistant of oldAssistants) {
    const existingAssistantIndex: number = assistants.findIndex(
      (assistant: User) => {
        return assistant.id === oldAssistant.userId;
      }
    );
    if (existingAssistantIndex >= 0) {
      assistants.splice(existingAssistantIndex, 1);
    } else {
      await oldAssistant.destroy();
    }
  }

  await CourseRole.bulkCreate(
    assistants.map((user: User) => {
      return {
        userId: user.id,
        courseId: courseId,
        role: CourseRoleType.Assistant,
      };
    })
  );
};
