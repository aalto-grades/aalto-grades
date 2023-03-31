// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface Grade {
  attainmentId: number,
  points: number
}

export interface Student {
  id?: number,
  studentNumber: string,
  grades: Array<Grade>
}

export interface AttainmentGrade {
  userId: number,
  attainableId: number,
  points: number
}
