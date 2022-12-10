// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import CourseInstancePartialGrade from './courseInstancePartialGrade';
import UserAssignmentGrade from './userAssignmentGrade';
import CourseTranslation from './courseTranslation';
import UserPartialGrade from './userPartialGrade';
import CourseAssignment from './courseAssignment';
import CourseInstance from './courseInstance';
import CourseResult from './courseResult';
import CourseRole from './courseRole';
import Course from './course';
import User from './user';

User.belongsToMany(CourseInstance, {
  through: CourseRole,
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
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
  foreignKey: 'responsibleTeacher'
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

CourseInstance.hasMany(CourseInstancePartialGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseResult.belongsTo(CourseInstance, {
  targetKey: 'id',
  foreignKey: 'courseInstanceId'
});

Course.hasMany(CourseInstancePartialGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseResult.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});

CourseInstancePartialGrade.hasMany(CourseAssignment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseAssignment.belongsTo(CourseInstancePartialGrade, {
  targetKey: 'id',
  foreignKey: 'courseInstancePartialGradeId'
});

User.hasMany(UserAssignmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserAssignmentGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId'
});

CourseAssignment.hasMany(UserAssignmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserAssignmentGrade.belongsTo(CourseAssignment, {
  targetKey: 'id',
  foreignKey: 'courseAssignmentId'
});

User.hasMany(UserPartialGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserPartialGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId'
});

CourseInstancePartialGrade.hasMany(UserPartialGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserPartialGrade.belongsTo(CourseInstancePartialGrade, {
  targetKey: 'id',
  foreignKey: 'courseInstancePartialGradeId'
});

export default {
  CourseInstancePartialGrade,
  UserAssignmentGrade,
  CourseTranslation,
  UserPartialGrade,
  CourseAssignment,
  CourseInstance,
  CourseResult,
  CourseRole,
  Course,
  User
};
