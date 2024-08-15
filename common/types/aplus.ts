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
  aplusCourse: AplusCourseDataSchema,
  date: DateSchema,
});
export const AplusGradeSourceDataSchema = z.discriminatedUnion('sourceType', [
  GradeSourceBase.extend(fullPointsBase).strict(),
  GradeSourceBase.extend(moduleBase).strict(),
  GradeSourceBase.extend(exerciseBase).strict(),
  GradeSourceBase.extend(difficultyBase).strict(),
]);

const NewGradeSourceBase = z.strictObject({
  courseTaskId: IdSchema,
  aplusCourse: AplusCourseDataSchema,
  date: DateSchema,
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
