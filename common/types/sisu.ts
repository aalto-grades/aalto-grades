// SPDX-FileCopyrightText: 2025 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import {z} from 'zod';

import {LocalizedStringSchema} from './general';

const CourseUnitSchema = z.strictObject({
  courseUnitGroupId: z.string(),
  credits: z.union([z.string(), z.number(), z.null()]),
});

const OrganizationSchema = z.strictObject({
  organisationId: z.string(),
  educationalInstitutionUrn: z.union([z.string(), z.null()]),
  roleUrn: z.string(),
  share: z.number(),
});

export const SisuCourseInstanceSchema = z.strictObject({
  id: z.string(),
  code: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  type: z.string(),
  name: LocalizedStringSchema,
  summary: z.strictObject({
    workload: LocalizedStringSchema,
    prerequisites: LocalizedStringSchema,
    learningOutcomes: LocalizedStringSchema,
    literature: z.union([LocalizedStringSchema.partial(), z.null()]),
    languageOfInstruction: LocalizedStringSchema,
    registration: LocalizedStringSchema,
    content: LocalizedStringSchema,
    cefrLevel: z.string(),
    level: LocalizedStringSchema,
    teacherInCharge: z.array(z.string()),
    assesmentMethods: LocalizedStringSchema,
    substitutes: z.strictObject({
      ...LocalizedStringSchema.shape,
      courseUnits: z.union([z.array(z.array(CourseUnitSchema)), z.null()]),
    }),
    additionalInformation: LocalizedStringSchema,
    gradingScale: LocalizedStringSchema,
    teachingPeriod: LocalizedStringSchema,
  }),
  organizations: z.array(OrganizationSchema),
  organizationId: z.string(),
  organizationName: LocalizedStringSchema,
  credits: z.strictObject({
    min: z.number(),
    max: z.number(),
  }),
  courseUnitId: z.string(),
  languageOfInstructionCodes: z.array(z.string()),
  teachers: z.array(z.string()),
  enrolmentStartDate: z.union([z.string(), z.null()]),
  enrolmentEndDate: z.union([z.string(), z.null()]),
  mincredits: z.string(),
});

export const SisuErrorSchema = z.strictObject({
  error: z.strictObject({
    code: z.number(),
    message: z.string(),
  }),
});

export const SisuCourseInstanceArraySchema = z.array(SisuCourseInstanceSchema);

export type CourseUnit = z.infer<typeof CourseUnitSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;
export type SisuCourseInstance = z.infer<typeof SisuCourseInstanceSchema>;
export type SisuError = z.infer<typeof SisuErrorSchema>;
