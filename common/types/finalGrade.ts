// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {DateOnlyString} from '@common/types';

export type NewFinalGrade = {
  userId: number;
  assessmentModelId: number;
  grade: number;
  date?: Date | DateOnlyString;
};

export type FinalGradeData = {
  userId: number;
  courseId: number;
  assessmentModelId: number;
  graderId: number;
  grade: number;
  date?: Date | DateOnlyString;
};
