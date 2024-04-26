// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FinalGradeData} from '@common/types';

export const mockFinalGrades: FinalGradeData[] = [
  {
    finalGradeId: 1,
    userId: 6,
    courseId: 1,
    assessmentModelId: 1,
    graderId: 2,
    grade: 4,
    date: new Date(),
    sisuExportDate: null,
  },
  {
    finalGradeId: 2,
    userId: 7,
    courseId: 1,
    assessmentModelId: 1,
    graderId: 2,
    grade: 0,
    date: new Date(),
    sisuExportDate: null,
  },
];
