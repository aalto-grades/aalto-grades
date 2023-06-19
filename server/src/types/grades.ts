// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import CourseResult from '../database/models/courseResult';
import User from '../database/models/user';

export interface AttainmentGradeData {
  userId?: number,
  attainmentId: number,
  grade: number,
  date?: Date,
  expiryDate?: Date
}

export interface StudentGrades {
  // Students ID (PK) in the database user table.
  id?: number,
  studentNumber: string,
  grades: Array<AttainmentGradeData>
}

export interface GradingResultsWithUser extends CourseResult {
  User: User
}
