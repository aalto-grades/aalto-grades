// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {AplusGradeSourceDataSchema} from './aplus';

export const CoursePartDataSchema = z.strictObject({
  id: z.number().int(),
  courseId: z.number().int(),
  name: z.string().min(1),
  daysValid: z.number().int().nonnegative(),
  maxGrade: z.number().nullable(),
  archived: z.boolean(),
  aplusGradeSources: z.array(AplusGradeSourceDataSchema),
});
export const NewCoursePartDataSchema = CoursePartDataSchema.omit({
  id: true,
  courseId: true,
  archived: true,
  aplusGradeSources: true,
}).strict();
export const EditCoursePartDataSchema = CoursePartDataSchema.omit({
  id: true,
  courseId: true,
  aplusGradeSources: true,
})
  .strict()
  .partial();

export const CoursePartDataArraySchema = z.array(CoursePartDataSchema);

export type NewCoursePartData = z.infer<typeof NewCoursePartDataSchema>;
export type CoursePartData = z.infer<typeof CoursePartDataSchema>;
export type EditCoursePartData = z.infer<typeof EditCoursePartDataSchema>;
