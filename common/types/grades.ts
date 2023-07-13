// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum Status {
  Pass = 'PASS',
  Fail = 'FAIL',
  Pending = 'PENDING',
}

export interface AttainmentGradeData {
  userId?: number,
  attainmentId: number,
  graderId?: number,
  grade: number,
  status: Status,
  manual: boolean,
  date?: Date,
  expiryDate?: Date
}
