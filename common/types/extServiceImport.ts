// SPDX-FileCopyrightText: 2026 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {DateSchema, IdSchema} from './general';
import {NewTaskGradeArraySchema} from './taskGrade';

export enum ExtServiceImportStreamEventType {
  Heartbeat = 'HEARTBEAT',
  Progress = 'PROGRESS',
  Result = 'RESULT',
  Error = 'ERROR',
}

export const ExtServiceImportStreamEventTypeSchema = z.enum([
  ExtServiceImportStreamEventType.Heartbeat,
  ExtServiceImportStreamEventType.Progress,
  ExtServiceImportStreamEventType.Result,
  ExtServiceImportStreamEventType.Error,
]);

export const ExtServiceImportRequestSchema = z.strictObject({
  courseTaskIds: z.array(IdSchema).nonempty(),
});

const ExtServiceImportProgressSchema = z.strictObject({
  message: z.string(),
  completedTasks: z.number().nonnegative(),
  totalTasks: z.number().int().positive(),
});

export const ExtServiceImportHeartbeatEventSchema = z.strictObject({
  type: z.literal(ExtServiceImportStreamEventType.Heartbeat),
  timestamp: DateSchema,
});

export const ExtServiceImportProgressEventSchema = z.strictObject({
  type: z.literal(ExtServiceImportStreamEventType.Progress),
  ...ExtServiceImportProgressSchema.shape,
});

export const ExtServiceImportResultEventSchema = z.strictObject({
  type: z.literal(ExtServiceImportStreamEventType.Result),
  ...ExtServiceImportProgressSchema.shape,
  grades: NewTaskGradeArraySchema,
});

export const ExtServiceImportErrorEventSchema = z.strictObject({
  type: z.literal(ExtServiceImportStreamEventType.Error),
  message: z.string(),
});

export const ExtServiceImportStreamEventSchema = z.discriminatedUnion('type', [
  ExtServiceImportHeartbeatEventSchema,
  ExtServiceImportProgressEventSchema,
  ExtServiceImportResultEventSchema,
  ExtServiceImportErrorEventSchema,
]);

export type ExtServiceImportRequest = z.infer<
  typeof ExtServiceImportRequestSchema
>;
export type ExtServiceImportStreamEvent = z.infer<
  typeof ExtServiceImportStreamEventSchema
>;
