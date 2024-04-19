// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export interface FinalGradeModelData {
  userId?: number;
  courseId: number;
  assessmentModelId: number;
  graderId?: number;
  grade: number;
  date?: Date;
}
