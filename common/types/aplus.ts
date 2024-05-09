// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

export enum AplusGradeSource {
  FullPoints = 'FULL_POINTS',
  Module = 'MODULE',
  Difficulty = 'DIFFICULTY',
}

export const AplusGradeSourceSchema = z.nativeEnum(AplusGradeSource);

export const AplusExerciseDataSchema = z.object({
  modules: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
    })
  ),
  difficulties: z.array(z.string()),
});

export const AplusAttainmentDataSchema = z
  .object({
    attainmentId: z.number().int(),
    aplusCourseId: z.number().int(),
    gradeSource: AplusGradeSourceSchema,
    moduleId: z.number().int().optional(),
    difficulty: z.string().optional(),
  })
  .refine(val => {
    // Depending on the grade source, different data must be provided
    const sources = (m: boolean, d: boolean): boolean =>
      (m ? val.moduleId !== undefined : val.moduleId === undefined) &&
      (d ? val.difficulty !== undefined : val.difficulty === undefined);

    switch (val.gradeSource) {
      case AplusGradeSource.FullPoints:
        return sources(false, false);
      case AplusGradeSource.Module:
        return sources(true, false);
      case AplusGradeSource.Difficulty:
        return sources(false, true);
    }
  });

export const NewAplusAttainmentArraySchema = z.array(AplusAttainmentDataSchema);

export type AplusExerciseData = z.infer<typeof AplusExerciseDataSchema>;
export type AplusAttainmentData = z.infer<typeof AplusAttainmentDataSchema>;
