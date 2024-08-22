// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {CoursePartData} from '@/common/types';

export const mockCourseParts: CoursePartData[] = [
  {
    id: 1,
    courseId: 1,
    name: 'Exercise 1',
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
    archived: false,
  },
  {
    id: 2,
    courseId: 1,
    name: 'Exercise 2',
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
    archived: false,
  },
  {
    id: 3,
    courseId: 1,
    name: 'Exam',
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000),
    archived: false,
  },
];
