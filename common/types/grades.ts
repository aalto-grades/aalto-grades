// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum Status {
  Pass = 'PASS',
  Fail = 'FAIL',
  Pending = 'PENDING'
}

export interface AttainmentGradeData {
  userId?: number,
  gradeId?: number,
  attainmentId: number,
  graderId?: number,
  grade: number,
  status: Status,
  manual: boolean,
  name?: string,
  tag?: string,
  date?: Date,
  expiryDate?: Date,
  subAttainments?: Array<AttainmentGradeData>
}

export interface FinalGrade {
  userId: number,
  studentNumber: string,
  grade: string,
  credits: number
}
