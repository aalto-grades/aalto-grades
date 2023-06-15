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
  foreignKey: 'parentId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainment.belongsTo(Attainment, {
  targetKey: 'id',
  foreignKey: 'parentId'
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

User.hasMany(CourseResult, {
  foreignKey: 'graderId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

CourseResult.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'graderId'
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

/*
Disabled since CourseResult does not have FK course id at the moment

CourseResult.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});
*/

User.hasMany(UserAttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserAttainmentGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId'
});

User.hasMany(UserAttainmentGrade, {
  foreignKey: 'graderId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

UserAttainmentGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'graderId'
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
