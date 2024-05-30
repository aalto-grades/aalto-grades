// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export type NewDbFinalGradeData = {
  userId: number;
  courseId: number;
  gradingModelId?: number | null;
  graderId: number;
  grade: number;
  sisuExportDate?: Date | null;
  date: Date;
  comment?: string | null;
};

export type NewDbGradeData = {
  userId: number;
  coursePartId: number;
  graderId: number;
  grade: number;
  sisuExportDate?: Date | null;
  date: Date;
  expiryDate: Date;
  comment?: string | null;
};
