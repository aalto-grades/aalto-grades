// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

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

export const AplusGradeSourceDataSchema = z
  .object({
    attainmentId: z.number().int(),
    aplusCourseId: z.number().int(),
    sourceType: AplusGradeSourceTypeSchema,
    moduleId: z.number().int().optional(),
    difficulty: z.string().optional(),
  })
  .refine(val => {
    // Depending on the grade source, different data must be provided
    const sources = (m: boolean, d: boolean): boolean =>
      (m ? val.moduleId !== undefined : val.moduleId === undefined) &&
      (d ? val.difficulty !== undefined : val.difficulty === undefined);

    switch (val.sourceType) {
      case AplusGradeSourceType.FullPoints:
        return sources(false, false);
      case AplusGradeSourceType.Module:
        return sources(true, false);
      case AplusGradeSourceType.Difficulty:
        return sources(false, true);
    }
  });

export const NewAplusGradeSourceArraySchema = z.array(
  AplusGradeSourceDataSchema
);

export type AplusExerciseData = z.infer<typeof AplusExerciseDataSchema>;
export type AplusGradeSourceData = z.infer<typeof AplusGradeSourceDataSchema>;

// In case this changes later
export type NewAplusGradeSourceData = AplusGradeSourceData;
