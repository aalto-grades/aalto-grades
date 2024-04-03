// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Formula, ParamsObject} from './formula';

export enum GradeType {
  Integer = 'INTEGER',
  Float = 'FLOAT',
}

export interface NewAttainmentData {
  courseId?: number;
  name: string;
  daysValid?: number;
}

export interface AttainmentData {
  id: number;
  courseId?: number;
  name: string;
  daysValid?: number;

  // To dismiss
  assessmentModelId?: number;
  parentId?: number;
  minRequiredGrade?: number;
  maxGrade?: number;
  formula?: Formula;
  formulaParams?: ParamsObject;
  gradeType?: GradeType;
  subAttainments?: Array<AttainmentData>;
}
