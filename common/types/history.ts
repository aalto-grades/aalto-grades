// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema} from './general';
import {BaseGradeDataSchema} from './taskGrade';
import {TeacherDataSchema} from './user';

export enum ActionType {
  Create = 'CREATE',
  Update = 'UPDATE',
  Delete = 'DELETE',
}

export const PreviousStateSchema = BaseGradeDataSchema.omit({
  user: true,
  grader: true,
  aplusGradeSource: true,
}).extend({
  userId: z.number(),
  graderId: z.number(),
  aplusGradeSourcesId: z.number().nullable(),
  createdAt: DateSchema,
  updatedAt: DateSchema,
});

export const TaskGradeHistorySchema = z.object({
  id: z.number(),
  courseTaskId: z.number(),
  actionType: z.nativeEnum(ActionType),
  updatedAt: DateSchema,
  createdAt: DateSchema,
  user: TeacherDataSchema.nullable(),
  taskGrade: BaseGradeDataSchema.nullable(),
  previousState: PreviousStateSchema.nullable(),
});

export const TaskGradeHistoryArraySchema = z.array(TaskGradeHistorySchema);

export type PreviousStateData = z.infer<typeof PreviousStateSchema>;

export type TaskGradeHistoryArray = z.infer<typeof TaskGradeHistoryArraySchema>;
export type TaskGradeHistory = z.infer<typeof TaskGradeHistorySchema>;
