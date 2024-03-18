// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FinalGradeData, Status} from '@common/types';

export const mockFinalGrades: FinalGradeData[] = [
  {
    userId: 1,
    courseId: 1,
    assessmentModelId: 1,
    graderId: 5,
    grade: 5,
    date: new Date('2023-01-01'),
  },
  {
    userId: 2,
    courseId: 1,
    assessmentModelId: 1,
    graderId: 5,
    grade: 5,
    date: new Date('2023-01-01'),
  },
  {
    userId: 3,
    courseId: 1,
    assessmentModelId: 1,
    graderId: 5,
    grade: 5,
    date: new Date('2023-01-01'),
  },
];
