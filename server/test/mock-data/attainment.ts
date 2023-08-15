// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, Formula } from 'aalto-grades-common/types';
import Attainment from '../../src/database/models/attainment';

export const mockAttainment: AttainmentData = {
  id: 1,
  name: 'optional-exercises',
  daysValid: 365,
  formula: Formula.WeightedAverage,
  formulaParams: {
    minRequiredGrade: 0,
    children: [
      ['ex-1', { weight: 0.5 }],
      ['ex-2', { weight: 0.5 }]
    ]
  },
  subAttainments: [
    {
      id: 2,
      name: 'ex-1',
      daysValid: 365,
      formula: Formula.Manual,
      formulaParams: {
        minRequiredGrade: 0
      },
      subAttainments: [],
    },
    {
      id: 3,
      name: 'ex-2',
      daysValid: 365,
      formula: Formula.WeightedAverage,
      formulaParams: {
        minRequiredGrade: 0,
        children: [
          ['ex-2.1', { weight: 0.5 }],
          ['ex-2.2', { weight: 0.5 }]
        ]
      },
      subAttainments: [
        {
          id: 4,
          name: 'ex-2.1',
          daysValid: 365,
          formula: Formula.WeightedAverage,
          formulaParams: {
            minRequiredGrade: 0,
            children: [
              ['ex-2.1.1', { weight: 0.5 }],
              ['ex-2.1.2', { weight: 0.5 }]
            ]
          },
          subAttainments: [
            {
              id: 5,
              name: 'ex-2.1.1',
              daysValid: 365,
              formula: Formula.Manual,
              formulaParams: {
                minRequiredGrade: 0
              },
              subAttainments: [],
            },
            {
              id: 6,
              name: 'ex-2.1.2',
              daysValid: 365,
              formula: Formula.Manual,
              formulaParams: {
                minRequiredGrade: 0
              },
              subAttainments: [],
            }
          ],
        },
        {
          id: 7,
          name: 'ex-2.2',
          daysValid: 365,
          formula: Formula.WeightedAverage,
          formulaParams: {
            minRequiredGrade: 0,
            children: [
              ['ex-2.2.1', { weight: 0.5 }],
              ['ex-2.2.2', { weight: 0.5 }]
            ]
          },
          subAttainments: [
            {
              id: 8,
              name: 'ex-2.2.1',
              daysValid: 365,
              formula: Formula.Manual,
              formulaParams: {
                minRequiredGrade: 0
              },
              subAttainments: [],
            },
            {
              id: 9,
              name: 'ex-2.2.2',
              daysValid: 365,
              formula: Formula.WeightedAverage,
              formulaParams: {
                minRequiredGrade: 0,
                children: [
                  ['ex-2.2.2.1', { weight: 0.5 }],
                  ['ex-2.2.2.2', { weight: 0.5 }]
                ]
              },
              subAttainments: [
                {
                  id: 10,
                  name: 'ex-2.2.2.1',
                  daysValid: 365,
                  formula: Formula.Manual,
                  formulaParams: {
                    minRequiredGrade: 0
                  },
                  subAttainments: [],
                },
                {
                  id: 11,
                  name: 'ex-2.2.2.2',
                  daysValid: 365,
                  formula: Formula.WeightedAverage,
                  formulaParams: {
                    minRequiredGrade: 0,
                    children: [
                      ['ex-2.2.2.2.1', { weight: 0.5 }],
                      ['ex-2.2.2.2.2', { weight: 0.5 }]
                    ]
                  },
                  subAttainments: [
                    {
                      id: 12,
                      name: 'ex-2.2.2.2.1',
                      daysValid: 365,
                      formula: Formula.Manual,
                      formulaParams: {
                        minRequiredGrade: 0
                      },
                      subAttainments: [],
                    },
                    {
                      id: 13,
                      name: 'ex-2.2.2.2.2',
                      daysValid: 365,
                      formula: Formula.Manual,
                      formulaParams: {
                        minRequiredGrade: 0
                      },
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
  daysValid: 365,
  minRequiredGrade: 1,
  maxGrade: 5,
  formula: Formula.Manual,
  formulaParams: {
    minRequiredGrade: 0
  },
  createdAt: new Date(),
  updatedAt: new Date()
}, { isNewRecord: false });
