// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {IdSchema} from './general';

export enum AplusGradeSourceType {
  FullPoints = 'FULL_POINTS',
  Module = 'MODULE',
  Difficulty = 'DIFFICULTY',
}

export const AplusCourseDataSchema = z.object({
  id: z.number().int(),
  courseCode: z.string(),
  name: z.string(),
  instance: z.string(),
  url: z.string().url(),
});
export const AplusCourseDataArraySchema = z.array(AplusCourseDataSchema);

export const AplusGradeSourceTypeSchema = z.nativeEnum(AplusGradeSourceType);

export const AplusExerciseDataSchema = z.object({
  modules: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
    })
  ),
  difficulties: z.array(z.string()),
});

// coursePartId is omitted in the A+ grade source list in course parts, but
// omiting from a union type doesn't appear to be possible
// https://github.com/colinhacks/zod/discussions/1434
const AplusGradeSourceBaseSchema = z
  .object({
    coursePartId: IdSchema,
    aplusCourseId: z.number().int(),
  })
  .strict();

export const AplusGradeSourceFullPointsSchema =
  AplusGradeSourceBaseSchema.extend({
    sourceType: z.literal(AplusGradeSourceType.FullPoints),
  });

export const AplusGradeSourceModuleSchema = AplusGradeSourceBaseSchema.extend({
  sourceType: z.literal(AplusGradeSourceType.Module),
  moduleId: z.number().int(),
});

export const AplusGradeSourceDifficultySchema =
  AplusGradeSourceBaseSchema.extend({
    sourceType: z.literal(AplusGradeSourceType.Difficulty),
    difficulty: z.string(),
  });

export const AplusGradeSourceDataSchema = z.discriminatedUnion('sourceType', [
  AplusGradeSourceFullPointsSchema,
  AplusGradeSourceModuleSchema,
  AplusGradeSourceDifficultySchema,
]);

export const NewAplusGradeSourceArraySchema = z.array(
  AplusGradeSourceDataSchema
);

export type AplusCourseData = z.infer<typeof AplusCourseDataSchema>;
export type AplusExerciseData = z.infer<typeof AplusExerciseDataSchema>;
export type AplusGradeSourceData = z.infer<typeof AplusGradeSourceDataSchema>;

// In case this changes later
export type NewAplusGradeSourceData = AplusGradeSourceData;
