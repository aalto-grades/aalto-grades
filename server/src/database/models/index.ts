// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Attainable from './attainable';
import Course from './course';
import CourseInstance from './courseInstance';
import CourseResult from './courseResult';
import CourseRole from './courseRole';
import CourseTranslation from './courseTranslation';
import User from './user';
import UserAttainmentGrade from './userAttainmentGrade';

Attainable.hasMany(Attainable, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainable.belongsTo(Attainable, {
  targetKey: 'id',
  foreignKey: 'attainableId'
});

User.belongsToMany(CourseInstance, {
  through: CourseRole,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
  as: 'student'
});

CourseInstance.belongsToMany(User, {
  through: CourseRole,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Course.hasMany(CourseInstance, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseInstance.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});

CourseInstance.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'responsibleTeacher',
  as: 'teacher'
});

Course.hasMany(CourseTranslation, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseTranslation.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});

User.hasMany(CourseResult, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseResult.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId'
});

CourseInstance.hasMany(CourseResult, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseResult.belongsTo(CourseInstance, {
  targetKey: 'id',
  foreignKey: 'courseInstanceId'
});

CourseInstance.hasMany(Attainable, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainable.belongsTo(CourseInstance, {
  targetKey: 'id',
  foreignKey: 'courseInstanceId'
});

Course.hasMany(Attainable, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainable.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});

CourseResult.belongsTo(CourseInstance, {
  targetKey: 'id',
  foreignKey: 'courseInstanceId'
});

CourseResult.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});

User.hasMany(UserAttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserAttainmentGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId'
});

Attainable.hasMany(UserAttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserAttainmentGrade.belongsTo(Attainable, {
  targetKey: 'id',
  foreignKey: 'attainableId'
});

export default {
  Attainable,
  Course,
  CourseInstance,
  CourseResult,
  CourseRole,
  CourseTranslation,
  User,
  UserAttainmentGrade
};
