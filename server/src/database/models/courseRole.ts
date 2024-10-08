// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  type CreationOptional,
  DataTypes,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  Model,
  Op,
} from 'sequelize';

import {CourseRoleType} from '@/common/types';
import {sequelize} from '..';
import Course from './course';
import User from './user';

export default class CourseRole extends Model<
  InferAttributes<CourseRole>,
  InferCreationAttributes<CourseRole>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User['id']>;
  declare courseId: ForeignKey<Course['id']>;
  declare role: CourseRoleType;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  /**
   * Updates database to match new teachers and assistants. If value is null, it
   * won't be updated. Will mutate the arrays.
   */
  static updateCourseRoles: (
    teachers: User[] | null,
    assistants: User[] | null,
    courseId: number
  ) => Promise<void>;
}

CourseRole.init(
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
    courseId: {
      type: DataTypes.INTEGER,
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
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Course.belongsToMany(User, {
  through: CourseRole,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Course.hasMany(CourseRole);

CourseRole.updateCourseRoles = async (
  teachers: User[] | null,
  assistants: User[] | null,
  courseId: number
): Promise<void> => {
  const oldRoles = await CourseRole.findAll({
    where: {
      courseId: courseId,
      role: {
        [Op.or]: [CourseRoleType.Teacher, CourseRoleType.Assistant],
      },
    },
  });

  const updateForRole = async (
    role: CourseRoleType,
    users: User[] | null
  ): Promise<void> => {
    if (users === null) return;

    for (const oldRole of oldRoles) {
      if (oldRole.role !== role) continue;

      const existingUserIndex = users.findIndex(
        teacher => teacher.id === oldRole.userId
      );
      if (existingUserIndex >= 0) users.splice(existingUserIndex, 1);
      else await oldRole.destroy();
    }

    if (users.length > 0) {
      await CourseRole.bulkCreate(
        users.map(user => ({
          userId: user.id,
          courseId: courseId,
          role: role,
        }))
      );
    }
  };

  await updateForRole(CourseRoleType.Teacher, teachers);
  await updateForRole(CourseRoleType.Assistant, assistants);
};
