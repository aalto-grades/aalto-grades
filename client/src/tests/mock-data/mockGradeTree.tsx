// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentGradeData} from '@common/types';

export const mockGradeTree: AttainmentGradeData = {
  userId: 1,
  attainmentId: 1,
  attainmentName: 'Root',
  grades: [
    {
      gradeId: 1,
      grader: {
        id: 1,
        name: 'Sir Teacher',
      },
      grade: 5,
      comment: '',
    },
  ],
  subAttainments: [
    {
      userId: 1,
      attainmentId: 2,
      attainmentName: 'Exam',
      grades: [
        {
          gradeId: 2,
          grader: {
            id: 1,
            name: 'Sir Teacher',
          },
          grade: 5,
          comment: '',
        },
      ],
    },
  ],
};
