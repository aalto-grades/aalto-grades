// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {AplusGradeSourceDataSchema} from './aplus';
import {FinalGradeDataArraySchema} from './finalGrade';
import {DateSchema, IdSchema, LanguageSchema} from './general';
import {UserDataSchema} from './user';

const BaseGradeDataSchema = z.strictObject({
  gradeId: IdSchema,
  grader: UserDataSchema,
  aplusGradeSource: AplusGradeSourceDataSchema.nullable(),
  grade: z.number(),
  exportedToSisu: DateSchema.nullable(),
  date: DateSchema,
  expiryDate: DateSchema.nullable(),
  comment: z.string().nullable(),
});
export const TaskGradeDataSchema = BaseGradeDataSchema.refine(
  val => !val.expiryDate || val.expiryDate >= val.date,
  {path: ['date']}
);
export const NewTaskGradeSchema = z
  .strictObject({
    studentNumber: z.string(),
    courseTaskId: z.number().int(),
    aplusGradeSourceId: z.number().int().optional(),
    grade: z.number(),
    date: DateSchema,
    expiryDate: DateSchema.nullable(),
    comment: z.string().nullable(),
  })
  .refine(val => !val.expiryDate || val.expiryDate >= val.date, {
    path: ['date'],
  });
export const EditTaskGradeDataSchema = BaseGradeDataSchema.omit({
  gradeId: true,
  aplusGradeSource: true,
  grader: true,
})
  .strict()
  .partial()
  .refine(val => !val.date || !val.expiryDate || val.expiryDate >= val.date, {
    path: ['date'],
  });

export const NewTaskGradeArraySchema = z.array(NewTaskGradeSchema);

export const CourseTaskGradesDataSchema = z.strictObject({
  courseTaskId: IdSchema,
  courseTaskName: z.string(),
  grades: z.array(TaskGradeDataSchema),
});
export const StudentRowSchema = z.strictObject({
  user: UserDataSchema,
  courseTasks: z.array(CourseTaskGradesDataSchema),
  finalGrades: FinalGradeDataArraySchema,
});
export const StudentRowArraySchema = z.array(StudentRowSchema);
export const LatestGradesSchema = z.array(
  z.strictObject({
    userId: IdSchema,
    date: DateSchema.nullable(),
  })
);
export const SisuCsvUploadSchema = z.strictObject({
  assessmentDate: DateSchema.nullable(), // Assessment date override
  completionLanguage: LanguageSchema.nullable(), // Defaults to course language
  studentNumbers: z.array(z.string()).nonempty(),
});

export type TaskGradeData = z.infer<typeof TaskGradeDataSchema>;
export type EditTaskGradeData = z.infer<typeof EditTaskGradeDataSchema>;
export type NewTaskGrade = z.infer<typeof NewTaskGradeSchema>;
export type CourseTaskGradesData = z.infer<typeof CourseTaskGradesDataSchema>;
export type StudentRow = z.infer<typeof StudentRowSchema>;
export type LatestGrades = z.infer<typeof LatestGradesSchema>;
export type SisuCsvUpload = z.infer<typeof SisuCsvUploadSchema>;
