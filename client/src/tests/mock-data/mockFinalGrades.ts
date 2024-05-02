// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {FinalGradeData} from '@/common/types';

export const mockFinalGrades: FinalGradeData[] = [
  {
    finalGradeId: 1,
    user: {
      id: 8,
      name: 'Carolyn Janek',
      email: 'carolyn.janek@aalto.fi',
      studentNumber: '325235',
    },
    courseId: 1,
    assessmentModelId: 1,
    grader: {
      id: 2,
      name: 'Timmy Teacher',
      email: 'teacher@aalto.fi',
      studentNumber: '123456',
    },
    grade: 4,
    date: new Date(),
    sisuExportDate: null,
  },
  {
    finalGradeId: 2,
    user: {
      id: 9,
      name: 'Vonda Morgan',
      email: 'vonda.morgan@aalto.fi',
      studentNumber: '826139',
    },
    courseId: 1,
    assessmentModelId: 1,
    grader: {
      id: 2,
      name: 'Timmy Teacher',
      email: 'teacher@aalto.fi',
      studentNumber: '123456',
    },
    grade: 0,
    date: new Date(),
    sisuExportDate: null,
  },
];
