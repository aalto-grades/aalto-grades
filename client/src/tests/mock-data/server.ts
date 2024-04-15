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

export function mockFailure(
  errors: string[],
  status: number
): ResponseResolver {
  return () =>
    new Response(JSON.stringify({errors: errors}), {
      headers: {'Content-Type': 'application/json'},
      status: status,
    });
}

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
  http.get('/v1/courses/1/finalGrades', mockSuccess(mockFinalGrades)),
  http.get('/v1/courses/1/attainments', mockSuccess(mockAttainments)),
  http.get('/v1/courses/1', mockSuccess(mockCourse))

  // http.get('*/v1/courses', mockSuccess(mockCourses)),
  // http.get('*/v1/courses/:courseId', mockSuccess(mockCourses[0])),

  // http.get(
  //   '*/v1/courses/:courseId/assessment-models',
  //   mockSuccess(mockAssessmentModels)
  // ),
  // http.get(
  //   '*/v1/courses/:courseId/assessment-models:assessmentModelId',
  //   mockSuccess(mockAssessmentModels[0])
  // ),

  // http.get(
  //   '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
  //   mockSuccess(mockAttainments)
  // ),
  // http.get(
  //   '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
  //   // mockSuccess(mockAttainments.subAttainments![2])
  //   mockSuccess(mockAttainments)
  // ),

  // http.get(
  //   '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades',
  //   mockSuccess(mockFinalGrades)
  // ),
  // http.post(
  //   '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/calculate',
  //   mockSuccess({})
  // ),
  // http.post(
  //   '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv',
  //   mockSuccess({})
  // ),

  // http.get('*/v1/formulas', mockSuccess(mockFormulas)),
  // http.get('*/v1/formulas/:formulaId', mockSuccess(mockFormulas[0])),

  // http.get('*/v1/user/:userId/courses', mockSuccess(mockCourses))
);
