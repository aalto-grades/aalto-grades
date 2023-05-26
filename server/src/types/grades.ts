// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface UserAttainmentGradeData {
  userId?: number,
  attainmentId: number,
  grade: number
}

export interface StudentGrades {
  // Students ID (PK) in the database user table.
  id?: number,
  studentNumber: string,
  grades: Array<UserAttainmentGradeData>
}
