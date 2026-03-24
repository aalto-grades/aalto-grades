// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {AplusGradeSourceDataSchema} from './aplus';
import {ExternalSourceDataSchema} from './extServices';
import {IdSchema} from './general';

export const CourseTaskDataSchema = z.strictObject({
  id: IdSchema,
  coursePartId: IdSchema,
  name: z.string().min(1),
  daysValid: z.number().int().nonnegative().nullable(),
  maxGrade: z.number().nullable(),
  archived: z.boolean(),
  aplusGradeSources: z.array(AplusGradeSourceDataSchema).optional(),
  externalSources: z.array(ExternalSourceDataSchema).optional(),
});

export const NewCourseTaskSchema = CourseTaskDataSchema.omit({
  id: true,
  archived: true,
  aplusGradeSources: true,
  externalSources: true,
}).strict();

export const EditCourseTaskSchema = CourseTaskDataSchema.omit({
  coursePartId: true,
  aplusGradeSources: true,
  externalSources: true,
})
  .strict()
  .partial({
    name: true,
    daysValid: true,
    maxGrade: true,
    archived: true,
  });

export const ModifyCourseTasksSchema = z
  .strictObject({
    add: z.array(NewCourseTaskSchema),
    edit: z.array(EditCourseTaskSchema),
    delete: z.array(IdSchema),
  })
  .partial();

export const CourseTaskDataArraySchema = z.array(CourseTaskDataSchema);

export type CourseTaskData = z.infer<typeof CourseTaskDataSchema>;
export type NewCourseTaskData = z.infer<typeof NewCourseTaskSchema>;
export type EditCourseTaskData = z.infer<typeof EditCourseTaskSchema>;
export type ModifyCourseTasks = z.infer<typeof ModifyCourseTasksSchema>;
