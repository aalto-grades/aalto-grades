// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula } from 'aalto-grades-common/types';
import { AttainmentData } from 'aalto-grades-common/types/attainment';
import Attainment from '../../src/database/models/attainment';

export const mockAttainment: AttainmentData = {
  id: 1,
  name: '2 optional exercises',
  tag: 'optional-exercises',
  daysValid: 365,
  formula: Formula.WeightedAverage,
  formulaParams: {
    weights: [
      ['ex-1', 0.5],
      ['ex-2', 0.5]
    ]
  },
  subAttainments: [
    {
      id: 2,
      name: 'Exercise 1',
      tag: 'ex-1',
      daysValid: 365,
      formula: Formula.Manual,
      subAttainments: [],
    },
    {
      id: 3,
      name: 'Exercise 2',
      tag: 'ex-2',
      daysValid: 365,
      formula: Formula.WeightedAverage,
      formulaParams: {
        weights: [
          ['ex-2.1', 0.5],
          ['ex-2.2', 0.5]
        ]
      },
      subAttainments: [
        {
          id: 4,
          name: 'Exercise 2.1',
          tag: 'ex-2.1',
          daysValid: 365,
          formula: Formula.WeightedAverage,
          formulaParams: {
            weights: [
              ['ex-2.1.1', 0.5],
              ['ex-2.1.2', 0.5]
            ]
          },
          subAttainments: [
            {
              id: 5,
              name: 'Exercise 2.1.1',
              tag: 'ex-2.1.1',
              daysValid: 365,
              formula: Formula.Manual,
              subAttainments: [],
            },
            {
              id: 6,
              name: 'Exercise 2.1.2',
              tag: 'ex-2.1.2',
              daysValid: 365,
              formula: Formula.Manual,
              subAttainments: [],
            }
          ],
        },
        {
          id: 7,
          name: 'Exercise 2.2',
          tag: 'ex-2.2',
          daysValid: 365,
          formula: Formula.WeightedAverage,
          formulaParams: {
            weights: [
              ['ex-2.2.1', 0.5],
              ['ex-2.2.2', 0.5]
            ]
          },
          subAttainments: [
            {
              id: 8,
              name: 'Exercise 2.2.1',
              tag: 'ex-2.2.1',
              daysValid: 365,
              formula: Formula.Manual,
              subAttainments: [],
            },
            {
              id: 9,
              name: 'Exercise 2.2.2',
              tag: 'ex-2.2.2',
              daysValid: 365,
              formula: Formula.WeightedAverage,
              formulaParams: {
                weights: [
                  ['ex-2.2.2.1', 0.5],
                  ['ex-2.2.2.2', 0.5]
                ]
              },
              subAttainments: [
                {
                  id: 10,
                  name: 'Exercise 2.2.2.1',
                  tag: 'ex-2.2.2.1',
                  daysValid: 365,
                  formula: Formula.Manual,
                  subAttainments: [],
                },
                {
                  id: 11,
                  name: 'Exercise 2.2.2.2',
                  tag: 'ex-2.2.2.2',
                  daysValid: 365,
                  formula: Formula.WeightedAverage,
                  formulaParams: {
                    weights: [
                      ['ex-2.2.2.2.1', 0.5],
                      ['ex-2.2.2.2.2', 0.5]
                    ]
                  },
                  subAttainments: [
                    {
                      id: 12,
                      name: 'Exercise 2.2.2.2.1',
                      tag: 'ex-2.2.2.2.1',
                      daysValid: 365,
                      formula: Formula.Manual,
                      subAttainments: [],
                    },
                    {
                      id: 13,
                      name: 'Exercise 2.2.2.2.2',
                      tag: 'ex-2.2.2.2.2',
                      daysValid: 365,
                      formula: Formula.Manual,
                      subAttainments: [],
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const jestMockAttainment: Attainment = new Attainment({
  id: 1,
  assessmentModelId: 7,
  parentId: 1,
  name: 'xxx',
  tag: 'yyy',
  daysValid: 365,
  formula: Formula.Manual,
  createdAt: new Date(),
  updatedAt: new Date()
}, { isNewRecord: false });
