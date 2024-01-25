// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FinalGrade, Status} from '@common/types';

export const mockFinalGrades: Array<FinalGrade> = [
  {
    userId: 1,
    studentNumber: '12345A',
    credits: 5,
    grades: [
      {
        gradeId: 1,
        grader: {
          id: 5,
          name: 'Good teacher',
        },
        grade: 5,
        status: Status.Pass,
        manual: true,
        date: new Date('2023-01-01'),
        comment: 'nice work',
      },
    ],
  },
  {
    userId: 2,
    studentNumber: '98745A',
    credits: 5,
    grades: [
      {
        gradeId: 1,
        grader: {
          id: 5,
          name: 'Evil teacher',
        },
        grade: 5,
        status: Status.Pass,
        manual: true,
        date: new Date('2023-01-01'),
        comment: 'bad work',
      },
    ],
  },
  {
    userId: 3,
    studentNumber: '12859A',
    credits: 5,
    grades: [
      {
        gradeId: 1,
        grader: {
          id: 5,
          name: 'Declarative teacher',
        },
        grade: 5,
        status: Status.Pass,
        manual: true,
        date: new Date('2023-01-01'),
        comment: 'you shall pass',
      },
    ],
  },
];
