// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {ResponseResolver, http, DefaultBodyType, type PathParams} from 'msw';
import {setupServer, SetupServer} from 'msw/node';

import {mockAssessmentModels} from './mockAssessmentModels';
import {mockAttainments} from './mockAttainments';
import {mockCourses} from './mockCourses';
import {mockFinalGrades} from './mockFinalGrades';
import {mockGradeTree} from './mockGradeTree';
import {mockInstances} from './mockInstancesWithStringDates';
import {mockSisuInstances} from './mockSisuInstances';
import {mockFormulas} from './mockFormulas';
import {type HttpRequestResolverExtras} from 'msw/lib/core/handlers/HttpHandler';
import {Mock} from 'vitest';
import {mockGradeFullTree} from './mockGradeFullTree';

export function mockSuccess(data: unknown) {
  return async () => {
    return new Response(JSON.stringify({data: data}), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  };
}

export function mockFailure(errors: Array<string>, status: number) {
  return async () => {
    return new Response(JSON.stringify({errors: errors}), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: status,
    });
  };
}

export function mockPostSuccess(
  func: Mock,
  data: unknown
): ResponseResolver<
  HttpRequestResolverExtras<PathParams>,
  DefaultBodyType,
  undefined
> {
  return async ({request}) => {
    func(await request.json());
    return new Response(JSON.stringify({data: data}), {
      headers: {
        'Content-Type': 'application/json',
      },
      status: 200,
    });
  };
}

export const server: SetupServer = setupServer(
  http.get('*/v1/courses', mockSuccess(mockCourses)),
  http.get('*/v1/courses/:courseId', mockSuccess(mockCourses[0])),

  http.get(
    '*/v1/courses/:courseId/assessment-models',
    mockSuccess(mockAssessmentModels)
  ),
  http.get(
    '*/v1/courses/:courseId/assessment-models:assessmentModelId',
    mockSuccess(mockAssessmentModels[0])
  ),

  http.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
    mockSuccess(mockAttainments)
  ),
  http.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
    // mockSuccess(mockAttainments.subAttainments![2])
    mockSuccess(mockAttainments)
  ),

  http.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades',
    mockSuccess(mockFinalGrades)
  ),
  http.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/fullTree',
    mockSuccess(mockGradeFullTree)
  ),
  http.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/user/:userId',
    mockSuccess(mockGradeTree)
  ),
  http.post(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/calculate',
    mockSuccess({})
  ),
  http.post(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv',
    mockSuccess({})
  ),

  http.get('*/v1/courses/:courseId/instances', mockSuccess(mockInstances)),
  http.get(
    '*/v1/courses/:courseId/instances/:courseInstanceId',
    mockSuccess(mockInstances[0])
  ),

  http.get('*/v1/formulas', mockSuccess(mockFormulas)),
  http.get('*/v1/formulas/:formulaId', mockSuccess(mockFormulas[0])),

  http.get('*/v1/sisu/courses/:courseCode', mockSuccess(mockSisuInstances)),
  http.get(
    '*/v1/sisu/instances/:sisuCourseInstanceId',
    mockSuccess(mockSisuInstances[0])
  ),

  http.get('*/v1/user/:userId/courses', mockSuccess(mockCourses))
);
