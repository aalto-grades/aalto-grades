// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DateOnlyString} from '@common/types';

export interface FinalGradeModelData {
  userId?: number;
  courseId: number;
  assessmentModelId: number;
  graderId?: number;
  grade: number;
  date?: Date | DateOnlyString;
}

export interface StudentFinalGrades {
  // User's ID (PK) in the database user table.
  id?: number;
  studentNumber: string;
  grades: Array<FinalGradeModelData>;
}
