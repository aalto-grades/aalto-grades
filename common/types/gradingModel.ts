// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {IdSchema} from './general';
import {GraphStructureSchema} from './graph';

// Types
export const GradingModelDataSchema = z.strictObject({
  id: IdSchema,
  courseId: IdSchema,
  coursePartId: IdSchema.nullable(),
  name: z.string(),
  graphStructure: GraphStructureSchema,
  archived: z.boolean(),
  hasArchivedCourseParts: z.boolean(),
  hasDeletedCourseParts: z.boolean(),
});
export const NewGradingModelDataSchema = GradingModelDataSchema.omit({
  id: true,
  courseId: true,
  coursePartId: true,
  archived: true,
  hasArchivedCourseParts: true,
  hasDeletedCourseParts: true,
}).strict();
export const EditGradingModelDataSchema = GradingModelDataSchema.omit({
  id: true,
  courseId: true,
  coursePartId: true,
  hasArchivedCourseParts: true,
  hasDeletedCourseParts: true,
})
  .strict()
  .partial();

export const GradingModelDataArraySchema = z.array(GradingModelDataSchema);

export type GradingModelData = z.infer<typeof GradingModelDataSchema>;
export type NewGradingModelData = z.infer<typeof NewGradingModelDataSchema>;
export type EditGradingModelData = z.infer<typeof EditGradingModelDataSchema>;
