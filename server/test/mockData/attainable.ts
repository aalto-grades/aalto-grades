// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { AttainableRequestData } from '../../src/types/attainable';

export const mockAttainable: AttainableRequestData = {
  name: '2 optional exercises',
  date: new Date(2023, 9, 1),
  expiryDate: new Date(2024, 8, 14),
  subAttainments: [
    {
      name: 'Exercise 1',
      date: new Date(2023, 9, 1),
      expiryDate: new Date(2024, 8, 14),
      subAttainments: [],
    },
    {
      name: 'Exercise 2',
      date: new Date(2023, 9, 1),
      expiryDate: new Date(2024, 8, 14),
      subAttainments: [
        {
          name: 'Exercise 2.1',
          date: new Date(2023, 9, 1),
          expiryDate: new Date(2024, 8, 14),
          subAttainments: [
            {
              name: 'Exercise 2.1.1',
              date: new Date(2023, 9, 1),
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [],
            },
            {
              name: 'Exercise 2.1.2',
              date: new Date(2023, 9, 1),
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [],
            }
          ],
        },
        {
          name: 'Exercise 2.2',
          date: new Date(2023, 9, 1),
          expiryDate: new Date(2024, 8, 14),
          subAttainments: [
            {
              name: 'Exercise 2.2.1',
              date: new Date(2023, 9, 1),
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [],
            },
            {
              name: 'Exercise 2.2.2',
              date: new Date(2023, 9, 1),
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [
                {
                  name: 'Exercise 2.2.2.1',
                  date: new Date(2023, 9, 1),
                  expiryDate: new Date(2024, 8, 14),
                  subAttainments: [],
                },
                {
                  name: 'Exercise 2.2.2.2',
                  date: new Date(2023, 9, 1),
                  expiryDate: new Date(2024, 8, 14),
                  subAttainments: [
                    {
                      name: 'Exercise 2.2.2.2.1',
                      date: new Date(2023, 9, 1),
                      expiryDate: new Date(2024, 8, 14),
                      subAttainments: [],
                    },
                    {
                      name: 'Exercise 2.2.2.2.2',
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
