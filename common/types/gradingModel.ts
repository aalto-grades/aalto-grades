// SPDX-FileCopyrightText: 2024 The Ossi Developers
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
  hasExpiredSources: z.boolean(),
  hasArchivedSources: z.boolean(),
  hasDeletedSources: z.boolean(),
});
export const NewGradingModelDataSchema = z.strictObject({
  coursePartId: IdSchema.nullable(),
  name: z.string(),
  graphStructure: GraphStructureSchema,
});
export const EditGradingModelDataSchema = z
  .strictObject({
    name: z.string(),
    graphStructure: GraphStructureSchema,
    archived: z.boolean(),
  })
  .partial();

export const GradingModelDataArraySchema = z.array(GradingModelDataSchema);

export type GradingModelData = z.infer<typeof GradingModelDataSchema>;
export type NewGradingModelData = z.infer<typeof NewGradingModelDataSchema>;
export type EditGradingModelData = z.infer<typeof EditGradingModelDataSchema>;
