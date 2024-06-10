// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {
  AplusGradeSourceDifficultySchema,
  AplusGradeSourceFullPointsSchema,
  AplusGradeSourceModuleSchema,
} from './aplus';

const omit = {coursePartId: true} as const;
export const CoursePartDataSchema = z.object({
  id: z.number().int(),
  courseId: z.number().int(),
  name: z.string().min(1),
  daysValid: z.number().int().nonnegative(),
  archived: z.boolean(),
  aplusGradeSources: z.array(
    z.discriminatedUnion('sourceType', [
      AplusGradeSourceFullPointsSchema.omit(omit),
      AplusGradeSourceModuleSchema.omit(omit),
      AplusGradeSourceDifficultySchema.omit(omit),
    ])
  ),
});
export const NewCoursePartDataSchema = CoursePartDataSchema.omit({
  id: true,
  courseId: true,
  archived: true,
  aplusGradeSources: true,
});
export const EditCoursePartDataSchema = CoursePartDataSchema.omit({
  id: true,
  courseId: true,
  aplusGradeSources: true,
}).partial();

export const CoursePartDataArraySchema = z.array(CoursePartDataSchema);

export type NewCoursePartData = z.infer<typeof NewCoursePartDataSchema>;
export type CoursePartData = z.infer<typeof CoursePartDataSchema>;
export type EditCoursePartData = z.infer<typeof EditCoursePartDataSchema>;
