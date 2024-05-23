// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ResponseResolver, http} from 'msw';
import {SetupServer, setupServer} from 'msw/node';
import {Mock} from 'vitest';

import {mockAssessmentModel} from './mockAssessmentModel';
import {mockAttainments} from './mockAttainments';
import {mockCourse} from './mockCourse';
import {mockFinalGrades} from './mockFinalGrades';
import {mockGrades} from './mockGrades';

export const mockSuccess = (data: unknown): ResponseResolver => {
  return () =>
    new Response(JSON.stringify(data), {
      headers: {'Content-Type': 'application/json'},
      status: 200,
    });
};

export const mockFailure = (
  errors: string[],
  status: number
): ResponseResolver => {
  return () =>
    new Response(JSON.stringify({errors: errors}), {
      headers: {'Content-Type': 'application/json'},
      status: status,
    });
};

export const mockPostSuccess = (
  func: Mock,
  data: unknown
): ResponseResolver => {
  return async ({request}) => {
    func(await request.json());
    return new Response(JSON.stringify({data: data}), {
      headers: {'Content-Type': 'application/json'},
      status: 200,
    });
  };
};

export const server: SetupServer = setupServer(
  http.get('/v1/courses/1/grades', mockSuccess(mockGrades)),
  http.get(
    '/v1/courses/1/assessment-models',
    mockSuccess([mockAssessmentModel])
  ),
  http.get('/v1/courses/1/final-grades', mockSuccess(mockFinalGrades)),
  http.get('/v1/courses/1/attainments', mockSuccess(mockAttainments)),
  http.get('/v1/courses/1', mockSuccess(mockCourse))
);
