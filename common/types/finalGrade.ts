// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export type NewFinalGrade = {
  userId: number;
  assessmentModelId: number;
  grade: number;
  date?: Date;
};

export type FinalGradeData = {
  userId: number;
  courseId: number;
  assessmentModelId: number;
  graderId: number;
  grade: number;
  date?: Date;
  sisuExportDate: Date | null;
};
