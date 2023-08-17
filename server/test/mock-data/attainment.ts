// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData, Formula, GradeType } from 'aalto-grades-common/types';

import Attainment from '../../src/database/models/attainment';

export const mockAttainment: AttainmentData = {
  id: 1,
  name: 'optional-exercises',
  daysValid: 365,
  minRequiredGrade: 0,
  maxGrade: 5,
  formula: Formula.WeightedAverage,
  formulaParams: {
    children: [
      ['ex-1', { weight: 0.5 }],
      ['ex-2', { weight: 0.5 }]
    ]
  },
  gradeType: GradeType.Float,
  subAttainments: [
    {
      id: 2,
      name: 'ex-1',
      daysValid: 365,
      minRequiredGrade: 0,
      maxGrade: 5,
      formula: Formula.Manual,
      formulaParams: {},
      gradeType: GradeType.Float,
      subAttainments: [],
    },
    {
      id: 3,
      name: 'ex-2',
      daysValid: 365,
      minRequiredGrade: 0,
      maxGrade: 5,
      formula: Formula.WeightedAverage,
      formulaParams: {
        children: [
          ['ex-2.1', { weight: 0.5 }],
          ['ex-2.2', { weight: 0.5 }]
        ]
      },
      gradeType: GradeType.Float,
      subAttainments: [
        {
          id: 4,
          name: 'ex-2.1',
          daysValid: 365,
          minRequiredGrade: 0,
          maxGrade: 5,
          formula: Formula.WeightedAverage,
          formulaParams: {
            children: [
              ['ex-2.1.1', { weight: 0.5 }],
              ['ex-2.1.2', { weight: 0.5 }]
            ]
          },
          gradeType: GradeType.Float,
          subAttainments: [
            {
              id: 5,
              name: 'ex-2.1.1',
              daysValid: 365,
              minRequiredGrade: 0,
              maxGrade: 5,
              formula: Formula.Manual,
              formulaParams: {},
              gradeType: GradeType.Float,
              subAttainments: [],
            },
            {
              id: 6,
              name: 'ex-2.1.2',
              daysValid: 365,
              minRequiredGrade: 0,
              maxGrade: 5,
              formula: Formula.Manual,
              formulaParams: {},
              gradeType: GradeType.Float,
              subAttainments: [],
            }
          ],
        },
        {
          id: 7,
          name: 'ex-2.2',
          daysValid: 365,
          minRequiredGrade: 0,
          maxGrade: 5,
          formula: Formula.WeightedAverage,
          formulaParams: {
            children: [
              ['ex-2.2.1', { weight: 0.5 }],
              ['ex-2.2.2', { weight: 0.5 }]
            ]
          },
          gradeType: GradeType.Float,
          subAttainments: [
            {
              id: 8,
              name: 'ex-2.2.1',
              daysValid: 365,
              minRequiredGrade: 0,
              maxGrade: 5,
              formula: Formula.Manual,
              formulaParams: {},
              gradeType: GradeType.Float,
              subAttainments: [],
            },
            {
              id: 9,
              name: 'ex-2.2.2',
              daysValid: 365,
              minRequiredGrade: 0,
              maxGrade: 5,
              formula: Formula.WeightedAverage,
              formulaParams: {
                children: [
                  ['ex-2.2.2.1', { weight: 0.5 }],
                  ['ex-2.2.2.2', { weight: 0.5 }]
                ]
              },
              gradeType: GradeType.Float,
              subAttainments: [
                {
                  id: 10,
                  name: 'ex-2.2.2.1',
                  daysValid: 365,
                  minRequiredGrade: 0,
                  maxGrade: 5,
                  formula: Formula.Manual,
                  formulaParams: {},
                  gradeType: GradeType.Float,
                  subAttainments: [],
                },
                {
                  id: 11,
                  name: 'ex-2.2.2.2',
                  daysValid: 365,
                  minRequiredGrade: 0,
                  maxGrade: 5,
                  formula: Formula.WeightedAverage,
                  formulaParams: {
                    children: [
                      ['ex-2.2.2.2.1', { weight: 0.5 }],
                      ['ex-2.2.2.2.2', { weight: 0.5 }]
                    ]
                  },
                  gradeType: GradeType.Float,
                  subAttainments: [
                    {
                      id: 12,
                      name: 'ex-2.2.2.2.1',
                      daysValid: 365,
                      minRequiredGrade: 0,
                      maxGrade: 5,
                      formula: Formula.Manual,
                      formulaParams: {},
                      gradeType: GradeType.Float,
                      subAttainments: [],
                    },
                    {
                      id: 13,
                      name: 'ex-2.2.2.2.2',
                      daysValid: 365,
                      minRequiredGrade: 0,
                      maxGrade: 5,
                      formula: Formula.Manual,
                      formulaParams: {},
                      gradeType: GradeType.Float,
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
  formulaParams: {},
  gradeType: GradeType.Float,
  createdAt: new Date(),
  updatedAt: new Date()
}, { isNewRecord: false });
