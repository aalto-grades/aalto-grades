// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Attainment from './attainment';
import Course from './course';
import CourseInstance from './courseInstance';
import CourseInstanceRole from './courseInstanceRole';
import CourseResult from './courseResult';
import CourseTranslation from './courseTranslation';
import User from './user';
import UserAttainmentGrade from './userAttainmentGrade';

Attainment.hasMany(Attainment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainment.belongsTo(Attainment, {
  targetKey: 'id',
  foreignKey: 'attainmentId'
});

User.belongsToMany(CourseInstance, {
  through: CourseInstanceRole,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

CourseInstance.belongsToMany(User, {
  through: CourseInstanceRole,
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

CourseInstance.hasMany(Attainment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainment.belongsTo(CourseInstance, {
  targetKey: 'id',
  foreignKey: 'courseInstanceId'
});

Course.hasMany(Attainment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainment.belongsTo(Course, {
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

Attainment.hasMany(UserAttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserAttainmentGrade.belongsTo(Attainment, {
  targetKey: 'id',
  foreignKey: 'attainmentId'
});

export default {
  Attainment,
  Course,
  CourseInstance,
  CourseInstanceRole,
  CourseResult,
  CourseTranslation,
  User,
  UserAttainmentGrade
};
