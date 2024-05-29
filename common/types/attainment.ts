// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export const CoursePartDataSchema = z.object({
  id: z.number().int(),
  courseId: z.number().int(),
  name: z.string().min(1),
  daysValid: z.number().int().nonnegative(),
  archived: z.boolean(),
});
export const NewCoursePartDataSchema = CoursePartDataSchema.omit({
  id: true,
  courseId: true,
  archived: true,
});
export const EditCoursePartDataSchema = CoursePartDataSchema.omit({
  id: true,
  courseId: true,
}).partial();

export const CoursePartDataArraySchema = z.array(CoursePartDataSchema);

export type NewCoursePartData = z.infer<typeof NewCoursePartDataSchema>;
export type CoursePartData = z.infer<typeof CoursePartDataSchema>;
export type EditCoursePartData = z.infer<typeof EditCoursePartDataSchema>;
