// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';
import {GraphStructureSchema} from './graph';

// Types
export const AssessmentModelDataSchema = z.object({
  id: z.number().int(),
  courseId: z.number().int(),
  name: z.string(),
  graphStructure: GraphStructureSchema,
  archived: z.boolean(),
  hasArchivedAttainments: z.boolean(),
  hasDeletedAttainments: z.boolean(),
});
export const NewAssessmentModelDataSchema = AssessmentModelDataSchema.omit({
  id: true,
  courseId: true,
  archived: true,
  hasArchivedAttainments: true,
  hasDeletedAttainments: true,
});
export const EditAssessmentModelDataSchema = AssessmentModelDataSchema.omit({
  id: true,
  courseId: true,
  hasArchivedAttainments: true,
  hasDeletedAttainments: true,
}).partial();

export const AssessmentModelDataArraySchema = z.array(
  AssessmentModelDataSchema
);

export type NewAssessmentModelData = z.infer<
  typeof NewAssessmentModelDataSchema
>;
export type AssessmentModelData = z.infer<typeof AssessmentModelDataSchema>;
export type EditAssessmentModelData = z.infer<
  typeof EditAssessmentModelDataSchema
>;
