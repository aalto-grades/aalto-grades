// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {StudentRow} from '@common/types';

export const mockGrades: StudentRow[] = [
  {
    user: {id: 6, studentNumber: '325235'},
    attainments: [
      {
        attainmentId: 1,
        attainmentName: 'Exercise 1',
        grades: [
          {
            gradeId: 1,
            grader: {id: 2, name: 'Terry teacher', studentNumber: '123456'},
            grade: 10,
            exportedToSisu: null,
            date: new Date(),
            expiryDate: new Date(
              new Date().getTime() + 365 * 24 * 60 * 60 * 1000
            ),
            comment: null,
          },
        ],
      },
      {
        attainmentId: 2,
        attainmentName: 'Exercise 2',
        grades: [
          {
            gradeId: 2,
            grader: {id: 2, name: 'Terry teacher', studentNumber: '123456'},
            grade: 1,
            exportedToSisu: null,
            date: new Date(),
            expiryDate: new Date(
              new Date().getTime() + 365 * 24 * 60 * 60 * 1000
            ),
            comment: null,
          },
        ],
      },
      {
        attainmentId: 3,
        attainmentName: 'Exam',
        grades: [
          {
            gradeId: 3,
            grader: {id: 2, name: 'Terry teacher', studentNumber: '123456'},
            grade: 9,
            exportedToSisu: null,
            date: new Date(),
            expiryDate: new Date(
              new Date().getTime() + 365 * 24 * 60 * 60 * 1000
            ),
            comment: null,
          },
        ],
      },
    ],
    finalGrades: [
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
    ],
  },
  {
    user: {id: 7, studentNumber: '826139'},
    attainments: [
      {
        attainmentId: 1,
        attainmentName: 'Exercise 1',
        grades: [
          {
            gradeId: 4,
            grader: {id: 2, name: 'Terry teacher', studentNumber: '123456'},
            grade: 8,
            exportedToSisu: null,
            date: new Date(),
            expiryDate: new Date(
              new Date().getTime() + 365 * 24 * 60 * 60 * 1000
            ),
            comment: null,
          },
        ],
      },
      {
        attainmentId: 2,
        attainmentName: 'Exercise 2',
        grades: [
          {
            gradeId: 5,
            grader: {id: 2, name: 'Terry teacher', studentNumber: '123456'},
            grade: 3,
            exportedToSisu: null,
            date: new Date(),
            expiryDate: new Date(
              new Date().getTime() + 365 * 24 * 60 * 60 * 1000
            ),
            comment: null,
          },
        ],
      },
      {
        attainmentId: 3,
        attainmentName: 'Exam',
        grades: [
          {
            gradeId: 6,
            grader: {id: 2, name: 'Terry teacher', studentNumber: '123456'},
            grade: 4,
            exportedToSisu: null,
            date: new Date(),
            expiryDate: new Date(
              new Date().getTime() + 365 * 24 * 60 * 60 * 1000
            ),
            comment: null,
          },
        ],
      },
    ],
    finalGrades: [
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
    ],
  },
];
