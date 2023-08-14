// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentGradeData, Status } from 'aalto-grades-common/types';

export const mockGradeTree: AttainmentGradeData = {
  userId: 1,
  attainmentId: 1,
  attainmentName: 'Root',
  grades: [
    {
      gradeId: 1,
      grader: {
        id: 1,
        name: 'Sir Teacher'
      },
      grade: 5,
      status: Status.Pass,
      manual: false,
      comment: ''
    }
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
            name: 'Sir Teacher'
          },
          grade: 5,
          status: Status.Pass,
          manual: true,
          comment: ''
        }
      ],
    }
  ]
}
