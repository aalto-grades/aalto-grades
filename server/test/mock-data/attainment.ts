// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainmentRequestData } from '../../src/types/attainment';

export const mockAttainment: AttainmentRequestData = {
  name: '2 optional exercises',
  tag: 'optional-exercises',
  date: new Date(2023, 9, 1),
  expiryDate: new Date(2024, 8, 14),
  subAttainments: [
    {
      name: 'Exercise 1',
      tag: 'ex-1',
      date: new Date(2023, 9, 1),
      expiryDate: new Date(2024, 8, 14),
      subAttainments: [],
    },
    {
      name: 'Exercise 2',
      tag: 'ex-2',
      date: new Date(2023, 9, 1),
      expiryDate: new Date(2024, 8, 14),
      subAttainments: [
        {
          name: 'Exercise 2.1',
          tag: 'ex-2.1',
          date: new Date(2023, 9, 1),
          expiryDate: new Date(2024, 8, 14),
          subAttainments: [
            {
              name: 'Exercise 2.1.1',
              tag: 'ex-2.1.1',
              date: new Date(2023, 9, 1),
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [],
            },
            {
              name: 'Exercise 2.1.2',
              tag: 'ex-2.1.2',
              date: new Date(2023, 9, 1),
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [],
            }
          ],
        },
        {
          name: 'Exercise 2.2',
          tag: 'ex-2.2',
          date: new Date(2023, 9, 1),
          expiryDate: new Date(2024, 8, 14),
          subAttainments: [
            {
              name: 'Exercise 2.2.1',
              tag: 'ex-2.2.1',
              date: new Date(2023, 9, 1),
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [],
            },
            {
              name: 'Exercise 2.2.2',
              tag: 'ex-2.2.2',
              date: new Date(2023, 9, 1),
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [
                {
                  name: 'Exercise 2.2.2.1',
                  tag: 'ex-2.2.2.1',
                  date: new Date(2023, 9, 1),
                  expiryDate: new Date(2024, 8, 14),
                  subAttainments: [],
                },
                {
                  name: 'Exercise 2.2.2.2',
                  tag: 'ex-2.2.2.2',
                  date: new Date(2023, 9, 1),
                  expiryDate: new Date(2024, 8, 14),
                  subAttainments: [
                    {
                      name: 'Exercise 2.2.2.2.1',
                      tag: 'ex-2.2.2.2.1',
                      date: new Date(2023, 9, 1),
                      expiryDate: new Date(2024, 8, 14),
                      subAttainments: [],
                    },
                    {
                      name: 'Exercise 2.2.2.2.2',
                      tag: 'ex-2.2.2.2.2',
                      date: new Date(2023, 9, 1),
                      expiryDate: new Date(2024, 8, 14),
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
