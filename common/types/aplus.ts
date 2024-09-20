// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema, IdSchema} from './general';

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
  maxGrade: z.number().int(),
  modules: z.array(
    z.strictObject({
      id: z.number().int(),
      name: z.string(),
      closingDate: DateSchema,
      maxGrade: z.number().int(),
      exercises: z.array(
        z.strictObject({
          id: z.number().int(),
          name: z.string(),
          maxGrade: z.number().int(),
        })
      ),
    })
  ),
  difficulties: z.array(
    z.strictObject({
      difficulty: z.string(),
      maxGrade: z.number().int(),
    })
  ),
});

const FullPointsBase = z.strictObject({
  sourceType: z.literal(AplusGradeSourceType.FullPoints),
});
const ModuleBase = z.strictObject({
  sourceType: z.literal(AplusGradeSourceType.Module),
  moduleId: z.number().int(),
  moduleName: z.string(),
});
const ExerciseBase = z.strictObject({
  sourceType: z.literal(AplusGradeSourceType.Exercise),
  exerciseId: z.number().int(),
  exerciseName: z.string(),
});
const DifficultyBase = z.strictObject({
  sourceType: z.literal(AplusGradeSourceType.Difficulty),
  difficulty: z.string(),
});

const GradeSourceBase = z.strictObject({
  id: IdSchema,
  courseTaskId: IdSchema,
  aplusCourse: AplusCourseDataSchema,
  date: DateSchema,
});
export const AplusGradeSourceDataSchema = z.discriminatedUnion('sourceType', [
  GradeSourceBase.merge(FullPointsBase).strict(),
  GradeSourceBase.merge(ModuleBase).strict(),
  GradeSourceBase.merge(ExerciseBase).strict(),
  GradeSourceBase.merge(DifficultyBase).strict(),
]);

const NewGradeSourceBase = z.strictObject({
  courseTaskId: IdSchema,
  aplusCourse: AplusCourseDataSchema,
  date: DateSchema,
});
export const NewAplusGradeSourceSchema = z.discriminatedUnion('sourceType', [
  NewGradeSourceBase.merge(FullPointsBase).strict(),
  NewGradeSourceBase.merge(ModuleBase).strict(),
  NewGradeSourceBase.merge(ExerciseBase).strict(),
  NewGradeSourceBase.merge(DifficultyBase).strict(),
]);
export const NewAplusGradeSourceArraySchema = z.array(
  NewAplusGradeSourceSchema
);

export type AplusFullPoints = z.infer<typeof FullPointsBase>;
export type AplusModule = z.infer<typeof ModuleBase>;
export type AplusExercise = z.infer<typeof ExerciseBase>;
export type AplusDifficulty = z.infer<typeof DifficultyBase>;

export type AplusCourseData = z.infer<typeof AplusCourseDataSchema>;
export type AplusExerciseData = z.infer<typeof AplusExerciseDataSchema>;
export type AplusGradeSourceData = z.infer<typeof AplusGradeSourceDataSchema>;
export type NewAplusGradeSourceData = z.infer<typeof NewAplusGradeSourceSchema>;
