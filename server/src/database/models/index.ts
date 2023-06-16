// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import AssessmentModel from './assessmentModel';
import Attainment from './attainment';
import AttainmentGrade from './attainmentGrade';
import Course from './course';
import CourseInstance from './courseInstance';
import CourseInstanceRole from './courseInstanceRole';
import CourseResult from './courseResult';
import CourseTranslation from './courseTranslation';
import User from './user';

AssessmentModel.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});

Course.hasMany(AssessmentModel, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AssessmentModel.hasMany(Attainment, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Attainment.belongsTo(AssessmentModel, {
  targetKey: 'id',
  foreignKey: 'assessmentModelId'
});

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
  as: 'grader',
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

/*
Disabled since CourseResult does not have FK course id at the moment

CourseResult.belongsTo(Course, {
  targetKey: 'id',
  foreignKey: 'courseId'
});
*/

User.hasMany(AttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AttainmentGrade.belongsTo(User, {
  targetKey: 'id',
  foreignKey: 'userId'
});

User.hasMany(AttainmentGrade, {
  foreignKey: 'graderId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AttainmentGrade.belongsTo(User, {
  as: 'grader',
  targetKey: 'id',
  foreignKey: 'graderId'
});

Attainment.hasMany(AttainmentGrade, {
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

AttainmentGrade.belongsTo(Attainment, {
  targetKey: 'id',
  foreignKey: 'attainmentId'
});

export default {
  AssessmentModel,
  Attainment,
  AttainmentGrade,
  Course,
  CourseInstance,
  CourseInstanceRole,
  CourseResult,
  CourseTranslation,
  User
};
