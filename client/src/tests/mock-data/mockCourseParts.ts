// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CoursePartData} from '@/common/types';

export const mockCourseParts: CoursePartData[] = [
  {
    id: 1,
    courseId: 1,
    name: 'Exercise 1',
    daysValid: 365,
    archived: false,
    aplusGradeSources: [],
  },
  {
    id: 2,
    courseId: 1,
    name: 'Exercise 2',
    daysValid: 365,
    archived: false,
    aplusGradeSources: [],
  },
  {
    id: 3,
    courseId: 1,
    name: 'Exam',
    daysValid: 365,
    archived: false,
    aplusGradeSources: [],
  },
];
