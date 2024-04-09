// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import {GraphStructureSchema} from './graph';

// Types
export const AssesmentModelDataSchema = z.object({
  id: z.number().int().optional(),
  courseId: z.number().int().optional(),
  name: z.string(),
  graphStructure: GraphStructureSchema,
});
export const AssessmentModelDataArraySchema = z.array(AssesmentModelDataSchema);

export type AssessmentModelData = z.infer<typeof AssesmentModelDataSchema>;
