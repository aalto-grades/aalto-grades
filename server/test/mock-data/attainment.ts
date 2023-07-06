// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Formula } from 'aalto-grades-common/types';
import { AttainmentData } from 'aalto-grades-common/types/attainment';

export const mockAttainment: AttainmentData = {
  name: '2 optional exercises',
  tag: 'optional-exercises',
  formula: Formula.WeightedAverage,
  daysValid: 365,
  subAttainments: [
    {
      name: 'Exercise 1',
      tag: 'ex-1',
      daysValid: 365,
      formula: Formula.Manual,
      parentFormulaParams: {
        weight: 0.5
      },
      subAttainments: [],
    },
    {
      name: 'Exercise 2',
      tag: 'ex-2',
      daysValid: 365,
      formula: Formula.WeightedAverage,
      parentFormulaParams: {
        weight: 0.5
      },
      subAttainments: [
        {
          name: 'Exercise 2.1',
          tag: 'ex-2.1',
          daysValid: 365,
          formula: Formula.WeightedAverage,
          parentFormulaParams: {
            weight: 0.5
          },
          subAttainments: [
            {
              name: 'Exercise 2.1.1',
              tag: 'ex-2.1.1',
              daysValid: 365,
              formula: Formula.Manual,
              parentFormulaParams: {
                weight: 0.5
              },
              subAttainments: [],
            },
            {
              name: 'Exercise 2.1.2',
              tag: 'ex-2.1.2',
              daysValid: 365,
              formula: Formula.Manual,
              parentFormulaParams: {
                weight: 0.5
              },
              subAttainments: [],
            }
          ],
        },
        {
          name: 'Exercise 2.2',
          tag: 'ex-2.2',
          daysValid: 365,
          formula: Formula.WeightedAverage,
          parentFormulaParams: {
            weight: 0.5
          },
          subAttainments: [
            {
              name: 'Exercise 2.2.1',
              tag: 'ex-2.2.1',
              daysValid: 365,
              formula: Formula.WeightedAverage,
              parentFormulaParams: {
                weight: 0.5
              },
              subAttainments: [],
            },
            {
              name: 'Exercise 2.2.2',
              tag: 'ex-2.2.2',
              daysValid: 365,
              formula: Formula.WeightedAverage,
              parentFormulaParams: {
                weight: 0.5
              },
              subAttainments: [
                {
                  name: 'Exercise 2.2.2.1',
                  tag: 'ex-2.2.2.1',
                  daysValid: 365,
                  formula: Formula.Manual,
                  parentFormulaParams: {
                    weight: 0.5
                  },
                  subAttainments: [],
                },
                {
                  name: 'Exercise 2.2.2.2',
                  tag: 'ex-2.2.2.2',
                  daysValid: 365,
                  formula: Formula.WeightedAverage,
                  parentFormulaParams: {
                    weight: 0.5
                  },
                  subAttainments: [
                    {
                      name: 'Exercise 2.2.2.2.1',
                      tag: 'ex-2.2.2.2.1',
                      daysValid: 365,
                      formula: Formula.Manual,
                      parentFormulaParams: {
                        weight: 0.5
                      },
                      subAttainments: [],
                    },
                    {
                      name: 'Exercise 2.2.2.2.2',
                      tag: 'ex-2.2.2.2.2',
                      daysValid: 365,
                      formula: Formula.Manual,
                      parentFormulaParams: {
                        weight: 0.5
                      },
                      subAttainments: [],
                    }
                  ],
                }
              ],
            }
          ],
        }
      ]
    }
  ]
};
