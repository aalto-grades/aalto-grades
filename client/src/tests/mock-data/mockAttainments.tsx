// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, Formula } from 'aalto-grades-common/types';

export const mockAttainments: AttainmentData = {
  id: 10000,
  name: 'Root',
  formula: Formula.WeightedAverage,
  formulaParams: {
    children: [
      ['Exercises', { weight: 0.5 }],
      ['Project', { weight: 0.3 }],
      ['Exam', { weight: 0.2 }]
    ]
  },
  daysValid: 0,
  minRequiredGrade: 1,
  maxGrade: 5,
  subAttainments: [
    {
      id: 1,
      name: 'Exercises',
      formula: Formula.Manual,
      formulaParams: {},
      daysValid: 100,
      minRequiredGrade: 1,
      maxGrade: 5,
      subAttainments: [
        {
          id: 11,
          name: '4 mandatory exercises',
          formula: Formula.Manual,
          formulaParams: {},
          daysValid: 100,
          minRequiredGrade: 1,
          maxGrade: 5,
          subAttainments: [
            {
              id: 111,
              name: 'Exercise 1',
              formula: Formula.Manual,
              formulaParams: {},
              daysValid: 100,
              minRequiredGrade: 1,
              maxGrade: 5,
              subAttainments: [],
            },
            {
              id: 112,
              name: 'Exercise 2',
              formula: Formula.Manual,
              formulaParams: {},
              daysValid: 100,
              minRequiredGrade: 1,
              maxGrade: 5,
              subAttainments: [],
            },
            {
              id: 113,
              name: 'Exercise 3',
              formula: Formula.Manual,
              formulaParams: {},
              daysValid: 100,
              minRequiredGrade: 1,
              maxGrade: 5,
              subAttainments: [
                {
                  id: 1131,
                  name: 'Exercise 3.1',
                  formula: Formula.Manual,
                  formulaParams: {},
                  daysValid: 100,
                  minRequiredGrade: 1,
                  maxGrade: 5,
                  subAttainments: [],
                },
                {
                  id: 1132,
                  name: 'Exercise 3.2',
                  formula: Formula.Manual,
                  formulaParams: {},
                  daysValid: 100,
                  minRequiredGrade: 1,
                  maxGrade: 5,
                  subAttainments: [],
                }
              ]
            },
            {
              id: 114,
              name: 'Exercise 4',
              formula: Formula.Manual,
              formulaParams: {},
              daysValid: 100,
              minRequiredGrade: 1,
              maxGrade: 5,
              subAttainments: [],
            }
          ]
        },
        {
          id: 12,
          name: '3 optional exercises',
          formula: Formula.Manual,
          formulaParams: {},
          daysValid: 100,
          minRequiredGrade: 1,
          maxGrade: 5,
          subAttainments: [
            {
              id: 121,
              name: 'Exercise 5',
              formula: Formula.Manual,
              formulaParams: {},
              daysValid: 100,
              minRequiredGrade: 1,
              maxGrade: 5,
              subAttainments: [],
            },
            {
              id: 122,
              name: 'Exercise 6',
              formula: Formula.Manual,
              formulaParams: {},
              daysValid: 100,
              minRequiredGrade: 1,
              maxGrade: 5,
              subAttainments: [],
            },
            {
              id: 123,
              name: 'Exercise 7',
              formula: Formula.Manual,
              formulaParams: {},
              daysValid: 100,
              minRequiredGrade: 1,
              maxGrade: 5,
              subAttainments: [],
            },
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Project',
      formula: Formula.Manual,
      formulaParams: {},
      daysValid: 100,
      minRequiredGrade: 1,
      maxGrade: 5,
      subAttainments: [],
    },
    {
      id: 3,
      name: 'Exam',
      formula: Formula.Manual,
      formulaParams: {},
      daysValid: 100,
      minRequiredGrade: 1,
      maxGrade: 5,
      subAttainments: [],
    }
  ]
};
