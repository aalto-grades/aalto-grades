// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {AplusGradeSourceDataSchema} from './aplus';

export const CourseTaskDataSchema = z.strictObject({
  id: z.number().int(),
  coursePartId: z.number().int(),
  name: z.string().min(1),
  daysValid: z.number().int().nonnegative().nullable(),
  maxGrade: z.number().nullable(),
  archived: z.boolean(),
  aplusGradeSources: z.array(AplusGradeSourceDataSchema),
});
export const NewCourseTaskSchema = CourseTaskDataSchema.omit({
  id: true,
  coursePartId: true,
  archived: true,
  aplusGradeSources: true,
}).strict();
export const EditCourseTaskSchema = CourseTaskDataSchema.omit({
  id: true,
  coursePartId: true,
  aplusGradeSources: true,
})
  .strict()
  .partial();

export const CourseTaskDataArraySchema = z.array(CourseTaskDataSchema);

export type CourseTaskData = z.infer<typeof CourseTaskDataSchema>;
export type NewCourseTaskData = z.infer<typeof NewCourseTaskSchema>;
export type EditCourseTaskData = z.infer<typeof EditCourseTaskSchema>;
