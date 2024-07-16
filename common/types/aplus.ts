// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {IdSchema} from './general';

export enum AplusGradeSourceType {
  FullPoints = 'FULL_POINTS',
  Module = 'MODULE',
  Exercise = 'EXERCISE',
  Difficulty = 'DIFFICULTY',
}

export const AplusCourseDataSchema = z.strictObject({
  id: z.number().int(),
  courseCode: z.string(),
  name: z.string(),
  instance: z.string(),
  url: z.string().url(),
});
export const AplusCourseDataArraySchema = z.array(AplusCourseDataSchema);

export const AplusGradeSourceTypeSchema = z.nativeEnum(AplusGradeSourceType);

export const AplusExerciseDataSchema = z.strictObject({
  modules: z.array(
    z.strictObject({
      id: z.number().int(),
      name: z.string(),
      exercises: z.array(
        z.strictObject({
          id: z.number().int(),
          name: z.string(),
        })
      ),
    })
  ),
  difficulties: z.array(z.string()),
});

const fullPointsBase = {
  sourceType: z.literal(AplusGradeSourceType.FullPoints),
};
const moduleBase = {
  sourceType: z.literal(AplusGradeSourceType.Module),
  moduleId: z.number().int(),
  moduleName: z.string(),
};
const exerciseBase = {
  sourceType: z.literal(AplusGradeSourceType.Exercise),
  exerciseId: z.number().int(),
  exerciseName: z.string(),
};
const difficultyBase = {
  sourceType: z.literal(AplusGradeSourceType.Difficulty),
  difficulty: z.string(),
};

const GradeSourceBase = z.strictObject({
  id: IdSchema,
  coursePartId: IdSchema,
  aplusCourse: AplusCourseDataSchema,
});
export const AplusGradeSourceDataSchema = z.discriminatedUnion('sourceType', [
  GradeSourceBase.extend(fullPointsBase).strict(),
  GradeSourceBase.extend(moduleBase).strict(),
  GradeSourceBase.extend(exerciseBase).strict(),
  GradeSourceBase.extend(difficultyBase).strict(),
]);

const NewGradeSourceBase = z.strictObject({
  coursePartId: IdSchema,
  aplusCourse: AplusCourseDataSchema,
});
const NewAplusGradeSourceSchema = z.discriminatedUnion('sourceType', [
  NewGradeSourceBase.extend(fullPointsBase).strict(),
  NewGradeSourceBase.extend(moduleBase).strict(),
  NewGradeSourceBase.extend(exerciseBase).strict(),
  NewGradeSourceBase.extend(difficultyBase).strict(),
]);
export const NewAplusGradeSourceArraySchema = z.array(
  NewAplusGradeSourceSchema
);

export type AplusCourseData = z.infer<typeof AplusCourseDataSchema>;
export type AplusExerciseData = z.infer<typeof AplusExerciseDataSchema>;
export type AplusGradeSourceData = z.infer<typeof AplusGradeSourceDataSchema>;
export type NewAplusGradeSourceData = z.infer<typeof NewAplusGradeSourceSchema>;
