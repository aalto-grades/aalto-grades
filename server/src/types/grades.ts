// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface AttainmentGradeModelData {
  userId?: number;
  attainmentId: number;
  graderId?: number;
  grade: number;
  manual?: boolean;
  date?: Date;
  expiryDate?: Date;
  attainmentName?: string;
}

export interface StudentGrades {
  // User's ID (PK) in the database user table.
  id?: number;
  studentNumber: string;
  grades: Array<AttainmentGradeModelData>;
}
