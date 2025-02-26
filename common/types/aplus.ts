// SPDX-FileCopyrightText: 2024 The Ossi Developers
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

const AplusExerciseSchema = z.strictObject({
  id: z.number().int(),
  name: z.string(),
  maxGrade: z.number().int(),
});
const AplusModuleSchema = z.strictObject({
  id: z.number().int(),
  name: z.string(),
  closingDate: DateSchema,
  maxGrade: z.number().int(),
  exercises: z.array(AplusExerciseSchema),
});
const AplusDifficultySchema = z.strictObject({
  difficulty: z.string(),
  maxGrade: z.number().int(),
});

export const AplusExerciseDataSchema = z.strictObject({
  maxGrade: z.number().int(),
  modules: z.array(AplusModuleSchema),
  difficulties: z.array(AplusDifficultySchema),
});

const FullPointsBaseSchema = z.strictObject({
  sourceType: z.literal(AplusGradeSourceType.FullPoints),
});
const ModuleBaseSchema = z.strictObject({
  sourceType: z.literal(AplusGradeSourceType.Module),
  moduleId: z.number().int(),
  moduleName: z.string(),
});
const ExerciseBaseSchema = z.strictObject({
  sourceType: z.literal(AplusGradeSourceType.Exercise),
  exerciseId: z.number().int(),
  exerciseName: z.string(),
});
const DifficultyBaseSchema = z.strictObject({
  sourceType: z.literal(AplusGradeSourceType.Difficulty),
  difficulty: z.string(),
});

const GradeSourceBaseSchema = z.strictObject({
  id: IdSchema,
  courseTaskId: IdSchema,
  aplusCourse: AplusCourseDataSchema,
  date: DateSchema,
});
export const AplusGradeSourceDataSchema = z.discriminatedUnion('sourceType', [
  GradeSourceBaseSchema.merge(FullPointsBaseSchema).strict(),
  GradeSourceBaseSchema.merge(ModuleBaseSchema).strict(),
  GradeSourceBaseSchema.merge(ExerciseBaseSchema).strict(),
  GradeSourceBaseSchema.merge(DifficultyBaseSchema).strict(),
]);

const NewGradeSourceBaseSchema = z.strictObject({
  courseTaskId: IdSchema,
  aplusCourse: AplusCourseDataSchema,
  date: DateSchema,
});
export const NewAplusGradeSourceSchema = z.discriminatedUnion('sourceType', [
  NewGradeSourceBaseSchema.merge(FullPointsBaseSchema).strict(),
  NewGradeSourceBaseSchema.merge(ModuleBaseSchema).strict(),
  NewGradeSourceBaseSchema.merge(ExerciseBaseSchema).strict(),
  NewGradeSourceBaseSchema.merge(DifficultyBaseSchema).strict(),
]);
export const NewAplusGradeSourceArraySchema = z.array(
  NewAplusGradeSourceSchema
);

export type AplusModule = z.infer<typeof AplusModuleSchema>;
export type AplusExercise = z.infer<typeof AplusExerciseSchema>;
export type AplusDifficulty = z.infer<typeof AplusDifficultySchema>;

export type AplusSourceFullPoints = z.infer<typeof FullPointsBaseSchema>;
export type AplusSourceModule = z.infer<typeof ModuleBaseSchema>;
export type AplusSourceExercise = z.infer<typeof ExerciseBaseSchema>;
export type AplusSourceDifficulty = z.infer<typeof DifficultyBaseSchema>;

export type AplusCourseData = z.infer<typeof AplusCourseDataSchema>;
export type AplusExerciseData = z.infer<typeof AplusExerciseDataSchema>;
export type AplusGradeSourceData = z.infer<typeof AplusGradeSourceDataSchema>;
export type NewAplusGradeSourceData = z.infer<typeof NewAplusGradeSourceSchema>;
