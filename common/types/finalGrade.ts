// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema, IdSchema, LanguageSchema} from './general';
import {GraphStructureSchema} from './graph';
import {StudentDataSchema, TeacherDataSchema} from './user';

/** Single task grade stored in the frozen snapshot of a final grade */
export const FrozenTaskGradeSchema = z.strictObject({
  grade: z.number(),
  date: z.iso.datetime(),
  expiryDate: z.iso.datetime().nullable(),
});
/** Hard copy of a grading model at the time the final grade was created */
export const FrozenGradingModelSchema = z.strictObject({
  id: IdSchema,
  name: z.string(),
  graphStructure: GraphStructureSchema,
});
/** Hard copy of a course part and its grading model */
export const FrozenCoursePartSchema = z.strictObject({
  id: IdSchema,
  name: z.string(),
  expiryDate: z.iso.datetime().nullable(),
  gradingModel: FrozenGradingModelSchema.nullable(),
});
/** Hard copy of a course task with the student's grades for it */
export const FrozenCourseTaskSchema = z.strictObject({
  id: IdSchema,
  coursePartId: IdSchema,
  name: z.string(),
  daysValid: z.number().int().nonnegative().nullable(),
  maxGrade: z.number().nullable(),
  grades: z.array(FrozenTaskGradeSchema),
});
/**
 * Hard copy of all the data used when the final grade was calculated: the
 * final grading model, course parts with their models, and tasks with the
 * student's grades. Absent (null) for final grades created before the field
 * was introduced.
 */
export const FinalGradeFrozenInfoSchema = z.strictObject({
  gradingModel: FrozenGradingModelSchema.nullable(),
  courseParts: z.array(FrozenCoursePartSchema),
  tasks: z.array(FrozenCourseTaskSchema),
});

export const FinalGradeDataSchema = z.strictObject({
  id: IdSchema,
  user: StudentDataSchema,
  courseId: IdSchema,
  gradingModelId: IdSchema.nullable(),
  grader: TeacherDataSchema,
  grade: z.number().int().min(0).max(5),
  date: DateSchema,
  sisuExportDate: DateSchema.nullable(),
  comment: z.string().nullable(),
  frozenInfo: FinalGradeFrozenInfoSchema.nullable(),
});
export const NewFinalGradeSchema = z.strictObject({
  userId: IdSchema,
  gradingModelId: IdSchema.nullable(),
  grade: z.number().int().min(0).max(5),
  date: DateSchema,
  comment: z.string().nullable(),
});
export const EditFinalGradeSchema = z
  .strictObject({
    grade: z.number().int().min(0).max(5),
    date: DateSchema,
    sisuExportDate: DateSchema.nullable(),
    comment: z.string().nullable(),
  })
  .partial();

export const SisuCsvUploadSchema = z.strictObject({
  assessmentDate: DateSchema.nullable(), // Assessment date override
  completionLanguage: LanguageSchema.nullable(), // Defaults to course language
  studentNumbers: z.array(z.string()).nonempty(),
});

/** Ids of final grades to operate on in bulk */
export const FinalGradeIdArraySchema = z.array(IdSchema).nonempty();

export const NewFinalGradeArraySchema = z.array(NewFinalGradeSchema);
export const FinalGradeDataArraySchema = z.array(FinalGradeDataSchema);

export type FinalGradeData = z.infer<typeof FinalGradeDataSchema>;
export type FinalGradeFrozenInfo = z.infer<typeof FinalGradeFrozenInfoSchema>;
export type FrozenGradingModel = z.infer<typeof FrozenGradingModelSchema>;
export type FrozenCoursePart = z.infer<typeof FrozenCoursePartSchema>;
export type FrozenCourseTask = z.infer<typeof FrozenCourseTaskSchema>;
export type FrozenTaskGrade = z.infer<typeof FrozenTaskGradeSchema>;
export type NewFinalGrade = z.infer<typeof NewFinalGradeSchema>;
export type EditFinalGrade = z.infer<typeof EditFinalGradeSchema>;
export type SisuCsvUpload = z.infer<typeof SisuCsvUploadSchema>;
export type FinalGradeIdArray = z.infer<typeof FinalGradeIdArraySchema>;
