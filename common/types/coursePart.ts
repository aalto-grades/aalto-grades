// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema, IdSchema} from './general';

export const CoursePartDataSchema = z.strictObject({
  id: IdSchema,
  courseId: IdSchema,
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
