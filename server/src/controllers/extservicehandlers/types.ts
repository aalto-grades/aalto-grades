// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import type {Request} from 'express';

import type {
  AplusCourseData,
  ExtServiceExerciseData,
  NewTaskGrade,
} from '@/common/types';

export type ExtServiceHandler = {
  externalServiceName: string;
  fetchCourses: (req: Request) => Promise<AplusCourseData[]>;
  fetchExerciseData: (req: Request) => Promise<ExtServiceExerciseData>;
  fetchGrades: (req: Request) => Promise<NewTaskGrade[]>;
};
