// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {ActionType, CourseRoleType} from '@/common/types';
import type TaskGrade from '../database/models/taskGrade';

export type NewDbCourseRole = {
  userId: number;
  courseId: number;
  role: CourseRoleType;
};

export type NewDbFinalGradeData = {
  userId: number;
  courseId: number;
  gradingModelId?: number | null;
  graderId: number;
  grade: number;
  date: Date;
  sisuExportDate?: Date | null;
  comment?: string | null;
};

export type NewDbTaskGradeData = {
  userId: number;
  courseTaskId: number;
  graderId: number;
  aplusGradeSourceId?: number;
  grade: number;
  date: Date;
  sisuExportDate?: Date | null;
  expiryDate: Date | null;
  comment?: string | null;
};

export type NewDbTaskGradeLogData = {
  userId: number;
  taskGradeId: number;
  actionType: ActionType;
  updatedState: TaskGrade;
};

export type SisuCsvFormat = {
  studentNumber: string;
  grade: string;
  credits: number;
  assessmentDate: string;
  completionLanguage: string;
  comment: string;
};
