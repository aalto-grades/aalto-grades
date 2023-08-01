// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { FinalGrade, Status } from 'aalto-grades-common/types';

export const mockFinalGrades: Array<FinalGrade> = [
  {
    userId: 1,
    studentNumber: '12345A',
    grade: Status.Pass,
    credits: 5
  },
  {
    userId: 2,
    studentNumber: '98745A',
    grade: Status.Pass,
    credits: 5
  },
  {
    userId: 3,
    studentNumber: '12859A',
    grade: Status.Pass,
    credits: 5
  }
];
