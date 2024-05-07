// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {AttainmentData} from '@common/types';

export const mockAttainments: AttainmentData[] = [
  {
    id: 1,
    courseId: 1,
    name: 'Exercise 1',
    daysValid: 365,
    archived: false,
  },
  {
    id: 2,
    courseId: 1,
    name: 'Exercise 2',
    daysValid: 365,
    archived: false,
  },
  {
    id: 3,
    courseId: 1,
    name: 'Exam',
    daysValid: 365,
    archived: false,
  },
];
