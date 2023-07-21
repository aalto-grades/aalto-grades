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
import { mockInstances } from './mockInstancesWithStringDates';
import { mockSisuInstances } from './mockSisuInstances';
import { mockFormulas } from './mockFormulas';

export function mockSuccess(data: unknown): ResponseResolver<RestRequest, RestContext> {
  return async (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: data
      })
    );
  }
}

export function mockFailure(
  errors: Array<string>, status: HttpCode
): ResponseResolver<RestRequest, RestContext> {
  return async (_req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    return res(
      ctx.status(status),
      ctx.json({
        success: false,
        errors: errors
      })
    );
  }
}

export function mockPostSuccess(
  func: jest.Mock, data: unknown
): ResponseResolver<RestRequest, RestContext> {
  return async (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    func(await req.json());
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: data
      })
    );
  }
}

export const server: SetupServer = setupServer(
  rest.get(
    '*/v1/courses',
    mockSuccess({ courses: mockCourses })
  ),
  rest.get(
    '*/v1/courses/:courseId',
    mockSuccess({ course: mockCourses[0] })
  ),

  rest.get(
    '*/v1/courses/:courseId/assessment-models',
    mockSuccess({ assessmentModels: mockAssessmentModels })
  ),
  rest.get(
    '*/v1/courses/:courseId/assessment-models:assessmentModelId',
    mockSuccess({ assessmentModel: mockAssessmentModels[0] })
  ),

  rest.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
    mockSuccess({ attainment: mockAttainments })
  ),
  rest.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments/:attainmentId',
    mockSuccess({ attainment: mockAttainments })
  ),

  rest.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades',
    mockSuccess({ finalGrades: mockFinalGrades })
  ),
  rest.post(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/calculate',
    mockSuccess(true)
  ),
  rest.post(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/grades/csv',
    mockSuccess({})
  ),

  rest.get(
    '*/v1/courses/:courseId/instances',
    mockSuccess({ courseInstances: mockInstances })
  ),
  rest.get(
    '*/v1/courses/:courseId/instances/:courseInstanceId',
    mockSuccess({ courseInstance: mockInstances[0] })
  ),

  rest.get(
    '*/v1/formulas',
    mockSuccess({ formulas: mockFormulas })
  ),
  rest.get(
    '*/v1/formulas/:formulaId',
    mockSuccess({ formula: mockFormulas[0] })
  ),

  rest.get(
    '*/v1/sisu/courses/:courseCode',
    mockSuccess({ courseInstances: mockSisuInstances })
  ),
  rest.get(
    '*/v1/sisu/instances/:sisuCourseInstanceId',
    mockSuccess({ courseInstance: mockSisuInstances[0] })
  ),

  rest.get(
    '*/v1/user/:userId/courses',
    mockSuccess({ courses: mockCourses })
  )
);
