// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentData } from 'aalto-grades-common/types/attainment';

export const mockAttainment: AttainmentData = {
  name: '2 optional exercises',
  tag: 'optional-exercises',
  daysValid: 365,
  subAttainments: [
    {
      name: 'Exercise 1',
      tag: 'ex-1',
      daysValid: 365,
      subAttainments: [],
    },
    {
      name: 'Exercise 2',
      tag: 'ex-2',
      daysValid: 365,
      subAttainments: [
        {
          name: 'Exercise 2.1',
          tag: 'ex-2.1',
          daysValid: 365,
          subAttainments: [
            {
              name: 'Exercise 2.1.1',
              tag: 'ex-2.1.1',
              daysValid: 365,
              subAttainments: [],
            },
            {
              name: 'Exercise 2.1.2',
              tag: 'ex-2.1.2',
              daysValid: 365,
              subAttainments: [],
            }
          ],
        },
        {
          name: 'Exercise 2.2',
          tag: 'ex-2.2',
          daysValid: 365,
          subAttainments: [
            {
              name: 'Exercise 2.2.1',
              tag: 'ex-2.2.1',
              daysValid: 365,
              subAttainments: [],
            },
            {
              name: 'Exercise 2.2.2',
              tag: 'ex-2.2.2',
              daysValid: 365,
              subAttainments: [
                {
                  name: 'Exercise 2.2.2.1',
                  tag: 'ex-2.2.2.1',
                  daysValid: 365,
                  subAttainments: [],
                },
                {
                  name: 'Exercise 2.2.2.2',
                  tag: 'ex-2.2.2.2',
                  daysValid: 365,
                  subAttainments: [
                    {
                      name: 'Exercise 2.2.2.2.1',
                      tag: 'ex-2.2.2.2.1',
                      daysValid: 365,
                      subAttainments: [],
                    },
                    {
                      name: 'Exercise 2.2.2.2.2',
                      tag: 'ex-2.2.2.2.2',
                      daysValid: 365,
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
