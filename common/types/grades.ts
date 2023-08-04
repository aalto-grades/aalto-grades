// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum Status {
  Pass = 'PASS',
  Fail = 'FAIL',
  Pending = 'PENDING'
}

export interface GradeOption {
  gradeId?: number,
  graderId?: number,
  grade: number,
  status: Status,
  manual: boolean,
  date?: Date,
  expiryDate?: Date
}

export interface AttainmentGradeData {
  userId?: number,
  attainmentId: number,
  attainmentName?: string,
  grades: Array<GradeOption>,
  subAttainments?: Array<AttainmentGradeData>
}

export interface FinalGrade {
  userId: number,
  studentNumber: string,
  grade: string,
  credits: number
}
