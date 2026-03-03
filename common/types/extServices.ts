import z from 'zod';

import {DateSchema, IdSchema} from './general';

export enum ExtServiceGradeSourceType {
  FullPoints = 'FULL_POINTS',
  Module = 'MODULE',
  Exercise = 'EXERCISE',
  Difficulty = 'DIFFICULTY',
}

export const ExtServiceGradeSourceTypeSchema = z.enum([
  ExtServiceGradeSourceType.FullPoints,
  ExtServiceGradeSourceType.Module,
  ExtServiceGradeSourceType.Exercise,
  ExtServiceGradeSourceType.Difficulty,
]);

export const GradeItemSchema = z.object({
  id: z.union([z.number().int(), z.string()]),
  itemname: z.string().nullable(),
  maxGrade: z.number().int().optional(),
});
export const ExtServiceCourseDataSchema = z.object({
  id: z.number().int(),
  courseCode: z.string(),
  name: z.string(),
  instance: z.string(),
  url: z.url().optional(),
});

export const ExtServiceExerciseDataSchema = z.array(
  z.object({
    id: ExtServiceGradeSourceTypeSchema,
    name: z.string(),
    items: z.array(
      z.object({
        ...GradeItemSchema.shape,
        sourceType: ExtServiceGradeSourceTypeSchema,
      }))
  }));

export const ExternalSourceInfoSchema = z.looseObject({
  sourceType: ExtServiceGradeSourceTypeSchema,
  sourceId: z.union([z.number().int(), z.string()]).optional(),
  itemname: z.string().optional(),
  difficulty: z.string().optional(),
  date: DateSchema.optional(),
});

export const ExternalSourceDataSchema = z.object({
  id: z.number().int(),
  externalCourse: ExtServiceCourseDataSchema,
  externalServiceName: z.string(),
  sourceInfo: ExternalSourceInfoSchema,
});

const NewGradeSourceBaseSchema = z.object({
  id: z.union([z.number().int(), z.string()]),
  courseTaskId: IdSchema,
  extServiceCourse: ExtServiceCourseDataSchema,
  // aplusCourse: ExtServiceCourseDataSchema,
  date: DateSchema.optional(),
  itemname: z.string(),
});

export const NewExtServiceGradeSourceSchema = z.discriminatedUnion('sourceType', [
  z.object({
    ...NewGradeSourceBaseSchema.shape,
    sourceType: ExtServiceGradeSourceTypeSchema,
  }),
]);

export type ExtServiceCourseData = z.infer<typeof ExtServiceCourseDataSchema>;
export type ExtServiceExerciseData = z.infer<typeof ExtServiceExerciseDataSchema>;
export type NewExtServiceGradeSourceData = z.infer<typeof NewExtServiceGradeSourceSchema>;
export type ExternalSourceInfo = z.infer<typeof ExternalSourceInfoSchema>;
export type ExternalSourceData = z.infer<typeof ExternalSourceDataSchema>;
