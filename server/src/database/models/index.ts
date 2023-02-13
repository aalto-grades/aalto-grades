// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import Course from './course';
import CourseAssignment from './courseAssignment';
import CourseInstance from './courseInstance';
import CourseInstancePartialGrade from './courseInstancePartialGrade';
import CourseResult from './courseResult';
import CourseRole from './courseRole';
import CourseTranslation from './courseTranslation';
import User from './user';
import UserAssignmentGrade from './userAssignmentGrade';
import UserPartialGrade from './userPartialGrade';

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
  Course,
  CourseAssignment,
  CourseInstance,
  CourseInstancePartialGrade,
  CourseResult,
  CourseRole,
  CourseTranslation,
  User,
  UserAssignmentGrade,
  UserPartialGrade
};
