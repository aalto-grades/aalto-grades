// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {ActionType, CourseRoleType} from '@/common/types';
import type TaskGrade from '../database/models/taskGrade';

export type NewDbCourseRole = {
  userId: number;
  courseId: number;
  role: CourseRoleType;
  expiryDate?: Date | null;
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
  courseTaskId: number;
  taskGradeId?: number;
  actionType: ActionType;
  previousState?: TaskGrade;
};

export type SisuCsvFormat = {
  studentNumber: string;
  grade: string;
  credits: number;
  assessmentDate: string;
  completionLanguage: string;
  comment: string;
};
