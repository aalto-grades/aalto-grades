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

const GradeSourceBase = z.object({
  attainmentId: IdSchema,
  aplusCourseId: z.number().int(),
});

export const AplusGradeSourceDataSchema = z.discriminatedUnion('sourceType', [
  GradeSourceBase.extend({
    sourceType: z.literal(AplusGradeSourceType.FullPoints),
  }),
  GradeSourceBase.extend({
    sourceType: z.literal(AplusGradeSourceType.Module),
    moduleId: z.number().int(),
  }),
  GradeSourceBase.extend({
    sourceType: z.literal(AplusGradeSourceType.Difficulty),
    difficulty: z.string(),
  }),
]);

export const NewAplusGradeSourceArraySchema = z.array(
  AplusGradeSourceDataSchema
);

export type AplusExerciseData = z.infer<typeof AplusExerciseDataSchema>;
export type AplusGradeSourceData = z.infer<typeof AplusGradeSourceDataSchema>;

// In case this changes later
export type NewAplusGradeSourceData = AplusGradeSourceData;
