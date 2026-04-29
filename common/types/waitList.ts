// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema, IdSchema} from './general';
import {StudentDataSchema} from './user';

export enum WaitListStatus {
  Pending = 'PENDING',
  Passed = 'PASSED',
  Failed = 'FAILED',
}

export const WaitListStatusSchema = z.enum(WaitListStatus);

export const WaitListEntryDataSchema = z.strictObject({
  id: IdSchema,
  user: StudentDataSchema,
  courseId: IdSchema,
  reason: z.string().nullable(),
  dateAdded: DateSchema,
  dateResolved: DateSchema.nullable(),
  status: WaitListStatusSchema,
});

export const NewWaitListEntrySchema = z.strictObject({
  studentNumber: z.string(),
  reason: z.string().nullable(),
  dateAdded: DateSchema.nullable().optional(),
  dateResolved: DateSchema.nullable().optional(),
  status: WaitListStatusSchema.nullable().optional(),
});

export const EditWaitListEntrySchema = z
  .strictObject({
    id: IdSchema,
    reason: z.string().nullable(),
    dateAdded: DateSchema.nullable(),
    dateResolved: DateSchema.nullable(),
    status: WaitListStatusSchema.nullable(),
  })
  .partial({
    reason: true,
    dateAdded: true,
    dateResolved: true,
    status: true,
  });

export const WaitListEntryArraySchema = z.array(WaitListEntryDataSchema);
export const NewWaitListEntryArraySchema = z.array(NewWaitListEntrySchema);
export const EditWaitListEntryArraySchema = z.array(EditWaitListEntrySchema);
export const WaitListEntryIdArraySchema = z.array(IdSchema).nonempty();

export const WaitListManualGradeSchema = z.strictObject({
  courseTaskId: IdSchema,
  grade: z.number(),
  comment: z.string().nullable().optional(),
});

export const WaitListReleaseSchema = z.strictObject({
  entryIds: z.array(IdSchema).nonempty(),
  status: WaitListStatusSchema.refine(
    status => status !== WaitListStatus.Pending,
    {message: 'Release status must be passed or failed'}
  ),
  dateResolved: DateSchema.nullable().optional(),
  manualGrade: WaitListManualGradeSchema.nullable().optional(),
});

export const WaitListImportEntrySchema = z.strictObject({
  entryId: IdSchema.nullable().optional(),
  studentNumber: z.string(),
  reason: z.string().nullable().optional(),
  dateAdded: DateSchema.nullable().optional(),
  dateResolved: DateSchema.nullable().optional(),
  status: WaitListStatusSchema.nullable().optional(),
});

export const WaitListImportEntryArraySchema = z.array(WaitListImportEntrySchema);

export type WaitListEntryData = z.infer<typeof WaitListEntryDataSchema>;
export type NewWaitListEntry = z.infer<typeof NewWaitListEntrySchema>;
export type EditWaitListEntry = z.infer<typeof EditWaitListEntrySchema>;
export type WaitListEntryIdArray = z.infer<typeof WaitListEntryIdArraySchema>;
export type WaitListManualGrade = z.infer<typeof WaitListManualGradeSchema>;
export type WaitListRelease = z.infer<typeof WaitListReleaseSchema>;
export type WaitListImportEntry = z.infer<typeof WaitListImportEntrySchema>;
