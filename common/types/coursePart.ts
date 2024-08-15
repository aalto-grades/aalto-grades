// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema} from './general';

export const CoursePartDataSchema = z.strictObject({
  id: z.number().int(),
  courseId: z.number().int(),
  name: z.string().min(1),
  expiryDate: DateSchema.nullable(),
  archived: z.boolean(),
});
export const NewCoursePartDataSchema = CoursePartDataSchema.omit({
  id: true,
  courseId: true,
  archived: true,
}).strict();
export const EditCoursePartDataSchema = CoursePartDataSchema.omit({
  id: true,
  courseId: true,
})
  .strict()
  .partial();

export const CoursePartDataArraySchema = z.array(CoursePartDataSchema);

export type CoursePartData = z.infer<typeof CoursePartDataSchema>;
export type NewCoursePartData = z.infer<typeof NewCoursePartDataSchema>;
export type EditCoursePartData = z.infer<typeof EditCoursePartDataSchema>;
