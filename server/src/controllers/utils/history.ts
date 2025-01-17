// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import type {PreviousStateData} from '@/common/types';
import type TaskGrade from '../../database/models/taskGrade';

/** Converts taskGrade database object into the TaskGradeData type */
export const parsePreviousState = (
  previousState: TaskGrade
): PreviousStateData => {
  return {
    id: previousState.id,
    userId: previousState.userId,
    courseTaskId: previousState.courseTaskId,
    aplusGradeSourcesId: previousState.aplusGradeSourceId,
    graderId: previousState.graderId,
    grade: previousState.grade,
    date: new Date(previousState.date),
    expiryDate:
      previousState.expiryDate === null
        ? null
        : new Date(previousState.expiryDate),
    comment: previousState.comment,
    createdAt: new Date(previousState.createdAt),
    updatedAt: new Date(previousState.updatedAt),
  };
};
