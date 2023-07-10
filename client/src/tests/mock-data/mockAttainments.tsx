// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, Formula } from 'aalto-grades-common/types';

const mockAttainments: AttainmentData = {
  id: 10000,
  name: 'Root',
  tag: 'root',
  formula: Formula.WeightedAverage,
  daysValid: 0,
  subAttainments: [
    {
      id: 1,
      name: 'Exercises',
      tag: 'test exercises',
      formula: Formula.WeightedAverage,
      daysValid: 100,
      subAttainments: [
        {
          id: 11,
          name: '4 mandatory exercises',
          tag: 'test tag 1',
          formula: Formula.Manual,
          daysValid: 100,
          subAttainments: [
            {
              id: 111,
              name: 'Exercise 1',
              tag: 'test tag 2',
              formula: Formula.Manual,
              daysValid: 100,
              subAttainments: [],
            },
            {
              id: 112,
              name: 'Exercise 2',
              tag: 'test tag 3',
              formula: Formula.Manual,
              daysValid: 100,
              subAttainments: [],
            },
            {
              id: 113,
              name: 'Exercise 3',
              tag: 'test tag 4',
              formula: Formula.Manual,
              daysValid: 100,
              subAttainments: [
                {
                  id: 1131,
                  name: 'Exercise 3.1',
                  tag: 'test tag 5',
                  formula: Formula.Manual,
                  daysValid: 100,
                  subAttainments: [],
                },
                {
                  id: 1132,
                  name: 'Exercise 3.2',
                  tag: 'test tag 6',
                  formula: Formula.Manual,
                  daysValid: 100,
                  subAttainments: [],
                }
              ]
            },
            {
              id: 114,
              name: 'Exercise 4',
              tag: 'test tag 7',
              formula: Formula.Manual,
              daysValid: 100,
              subAttainments: [],
            }
          ]
        },
        {
          id: 12,
          name: '3 optional exercises',
          tag: 'test tag 8',
          formula: Formula.Manual,
          daysValid: 100,
          subAttainments: [
            {
              id: 121,
              name: 'Exercise 5',
              tag: 'test tag 9',
              formula: Formula.Manual,
              daysValid: 100,
              subAttainments: [],
            },
            {
              id: 122,
              name: 'Exercise 6',
              tag: 'test tag 10',
              formula: Formula.Manual,
              daysValid: 100,
              subAttainments: [],
            },
            {
              id: 123,
              name: 'Exercise 7',
              tag: 'test tag 11',
              formula: Formula.Manual,
              daysValid: 100,
              subAttainments: [],
            },
          ]
        }
      ]
    },
    {
      id: 2,
      name: 'Project',
      tag: 'test project',
      formula: Formula.WeightedAverage,
      daysValid: 100,
      subAttainments: [],
    },
    {
      id: 3,
      name: 'Exam',
      tag: 'test exam',
      formula: Formula.WeightedAverage,
      daysValid: 100,
      subAttainments: [],
    }
  ]
};

export default mockAttainments;
