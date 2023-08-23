// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { HttpCode } from 'aalto-grades-common/types';
import { ResponseComposition, ResponseResolver, rest, RestContext, RestRequest } from 'msw';
import { setupServer, SetupServer } from 'msw/node';

import { mockAssessmentModels } from './mockAssessmentModels';
import { mockAttainments } from './mockAttainments';
import { mockCourses } from './mockCourses';
import { mockFinalGrades } from './mockFinalGrades';
import { mockGradeTree } from './mockGradeTree';
import { mockInstances } from './mockInstancesWithStringDates';
import { mockSisuInstances } from './mockSisuInstances';
import { mockFormulas } from './mockFormulas';

export function mockSuccess(data: unknown): ResponseResolver<RestRequest, RestContext> {
  return async (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(
      ctx.status(200),
      ctx.json({
        data: data
      })
    );
  };
}

export function mockFailure(
  errors: Array<string>, status: HttpCode
): ResponseResolver<RestRequest, RestContext> {
  return async (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(
      ctx.status(status),
      ctx.json({
        errors: errors
      })
    );
  };
}

export function mockPostSuccess(
  func: jest.Mock, data: unknown
): ResponseResolver<RestRequest, RestContext> {
  return async (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    func(await req.json());
    return res(
      ctx.status(200),
      ctx.json({
        data: data
      })
    );
  };
}

export const server: SetupServer = setupServer(
  rest.get(
    '*/v1/courses',
    mockSuccess(mockCourses)
  ),
  rest.get(
    '*/v1/courses/:courseId',
    mockSuccess(mockCourses[0])
  ),

  rest.get(
    '*/v1/courses/:courseId/assessment-models',
    mockSuccess(mockAssessmentModels)
  ),
  rest.get(
    '*/v1/courses/:courseId/assessment-models:assessmentModelId',
    mockSuccess(mockAssessmentModels[0])
  ),

  rest.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
    mockSuccess(mockAttainments)
  ),
  rest.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
    mockSuccess(mockAttainments)
  ),

  rest.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades',
    mockSuccess(mockFinalGrades)
  ),
  rest.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/user/:userId',
    mockSuccess(mockGradeTree)
  ),
  rest.post(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/calculate',
    mockSuccess({})
  ),
  rest.post(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv',
    mockSuccess({})
  ),

  rest.get(
    '*/v1/courses/:courseId/instances',
    mockSuccess(mockInstances)
  ),
  rest.get(
    '*/v1/courses/:courseId/instances/:courseInstanceId',
    mockSuccess(mockInstances[0])
  ),

  rest.get(
    '*/v1/formulas',
    mockSuccess(mockFormulas)
  ),
  rest.get(
    '*/v1/formulas/:formulaId',
    mockSuccess(mockFormulas[0])
  ),

  rest.get(
    '*/v1/sisu/courses/:courseCode',
    mockSuccess(mockSisuInstances)
  ),
  rest.get(
    '*/v1/sisu/instances/:sisuCourseInstanceId',
    mockSuccess(mockSisuInstances[0])
  ),

  rest.get(
    '*/v1/user/:userId/courses',
    mockSuccess(mockCourses)
  )
);
