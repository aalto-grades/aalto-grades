// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { DateOnlyString } from './general';
import { UserData } from './user';

export enum Status {
  Pass = 'PASS',
  Fail = 'FAIL',
  Pending = 'PENDING'
}

export enum GradeType {
  Integer = 'INTEGER',
  Float = 'FLOAT'
}

export interface GradeOption {
  gradeId?: number,
  grader: UserData,
  grade: number,
  status: Status,
  manual: boolean,
  date?: Date | DateOnlyString,
  expiryDate?: Date | DateOnlyString,
  comment: string
}

export interface AttainmentGradeData {
  userId?: number,
  attainmentId: number,
  attainmentName?: string,
  grades: Array<GradeOption>,
  subAttainments?: Array<AttainmentGradeData>
}

// TODO: Replace with a better name
export interface FinalGrade {
  userId: number,
  studentNumber: string,
  credits: number,
  grades: Array<GradeOption>
}

export interface EditGrade {
  grade?: number,
  status?: Status,
  date?: Date | DateOnlyString,
  expiryDate?: Date | DateOnlyString,
  comment?: string
}
