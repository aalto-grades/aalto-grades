// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {GraphStructureSchema} from './graph';

// Types
export const GradingModelDataSchema = z.object({
  id: z.number().int(),
  courseId: z.number().int(),
  name: z.string(),
  graphStructure: GraphStructureSchema,
  archived: z.boolean(),
  hasArchivedAttainments: z.boolean(),
  hasDeletedAttainments: z.boolean(),
});
export const NewGradingModelDataSchema = GradingModelDataSchema.omit({
  id: true,
  courseId: true,
  archived: true,
  hasArchivedAttainments: true,
  hasDeletedAttainments: true,
});
export const EditGradingModelDataSchema = GradingModelDataSchema.omit({
  id: true,
  courseId: true,
  hasArchivedAttainments: true,
  hasDeletedAttainments: true,
}).partial();

export const GradingModelDataArraySchema = z.array(GradingModelDataSchema);

export type GradingModelData = z.infer<typeof GradingModelDataSchema>;
export type NewGradingModelData = z.infer<typeof NewGradingModelDataSchema>;
export type EditGradingModelData = z.infer<typeof EditGradingModelDataSchema>;
