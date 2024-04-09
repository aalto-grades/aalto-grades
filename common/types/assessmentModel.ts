// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import {GraphStructureSchema} from './graph';

// Types
export const AssessmentModelDataSchema = z.object({
  id: z.number().int().optional(),
  courseId: z.number().int().optional(),
  name: z.string(),
  graphStructure: GraphStructureSchema,
});
export const AssessmentModelDataArraySchema = z.array(
  AssessmentModelDataSchema
);

export type AssessmentModelData = z.infer<typeof AssessmentModelDataSchema>;
