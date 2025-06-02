// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable camelcase */

import {z} from 'zod';

import {DateSchema} from '@/common/types';

// This file contains validation schemas and types for data returned by the A+
// API.

// General Pagination Schema
export const createAplusPaginationSchema = <T extends z.ZodTypeAny>(
  resultSchema: T
) =>
  z.object({
    count: z.number().int(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(resultSchema), // Changed from 'result' to 'results' and use the generic schema
  });

// GET /users/me
export const AplusCoursesResSchema = z.object({
  staff_courses: z.array(
    z.object({
      id: z.number().int(),
      code: z.string(),
      name: z.string(),
      instance_name: z.string(),
      html_url: z.string().url(),
    })
  ),
});

// GET /courses/<course_id>/exercises
export const AplusExercisesResSchema = z.object({
  results: z.array(
    z.object({
      id: z.number().int(),
      display_name: z.string(),
      closing_time: DateSchema,
      exercises: z.array(
        z.object({
          id: z.number().int(),
          display_name: z.string(),
          max_points: z.number().int(),
          difficulty: z.string(),
        })
      ),
    })
  ),
});

const AplusStudentPointsSchema = z.object({
  student_id: z.string().nullable(),
  points: z.number().int(),
  points_by_difficulty: z.record(z.number().int()),
  modules: z.array(
    z.object({
      id: z.number().int(),
      points: z.number().int(),
      exercises: z.array(
        z.object({
          id: z.number().int(),
          points: z.number().int(),
        })
      ),
    })
  ),
});

// GET /courses/<course_id>/points
export const AplusPointsResSchema = z.array(AplusStudentPointsSchema);

export type AplusCoursesRes = z.infer<typeof AplusCoursesResSchema>;
export type AplusExercisesRes = z.infer<typeof AplusExercisesResSchema>;
export type AplusStudentPoints = z.infer<typeof AplusStudentPointsSchema>;
export type AplusPointsRes = z.infer<typeof AplusPointsResSchema>;
