// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

/* eslint-disable camelcase */

import {z} from 'zod';

import {DateSchema} from '@/common/types';

// This file contains validation schemas and types for data returned by the A+
// API.

/** Create a A+ Pagination Schema, the resultSchema need to be an array */
export const createAplusPaginationSchema = <T extends z.ZodType>(
  resultSchema: T
): z.ZodObject<{
  count: z.ZodNumber;
  next: z.ZodNullable<z.ZodString>;
  previous: z.ZodNullable<z.ZodString>;
  results: T;
}> =>
  z.object({
    count: z.number().int(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: resultSchema, // Changed from 'result' to 'results' and use the generic schema
  });

export const AplusCourseSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  instance_name: z.string(),
  html_url: z.url(),
});

export const AplusCourseInfoSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  instance_name: z.string(),
  html_url: z.url(),
  language: z.string(),
  starting_time: z.iso.datetime({offset: true}),
  ending_time: z.iso.datetime({offset: true}),
});

// GET /users/me
export const AplusUserInfoResSchema = z.object({
  username: z.string(),
  staff_courses: z.array(AplusCourseSchema),
});

// GET /courses
export const AplusCoursesListResSchema = z.array(AplusCourseSchema);

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
  points_by_difficulty: z.record(z.string(), z.number().int()),
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

export type AplusCoursesRes = z.infer<typeof AplusUserInfoResSchema>;
export type AplusExercisesRes = z.infer<typeof AplusExercisesResSchema>;
export type AplusStudentPoints = z.infer<typeof AplusStudentPointsSchema>;
export type AplusPointsRes = z.infer<typeof AplusPointsResSchema>;
