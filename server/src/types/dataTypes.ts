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
  courseTaskId: number;
  graderId: number;
  aplusGradeSourceId?: number;
  grade: number;
  sisuExportDate?: Date | null;
  date: Date;
  expiryDate: Date | null;
  comment?: string | null;
};

export type SisuCsvFormat = {
  studentNumber: string;
  grade: string;
  credits: number;
  assessmentDate: string;
  completionLanguage: string;
  comment: string;
};
