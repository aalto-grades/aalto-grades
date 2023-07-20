// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { ResponseComposition, ResponseResolver, rest, RestContext, RestRequest } from 'msw';
import { setupServer, SetupServer } from 'msw/node';

import { mockAssessmentModels } from './mockAssessmentModels';
import { mockAttainments } from './mockAttainments';
import { mockCourses } from './mockCourses';
import { mockFinalGrades } from './mockFinalGrades';
import { mockInstances } from './mockInstancesWithStringDates';
import { mockSisuInstances } from './mockSisuInstances';
import { mockFormulas } from './mockFormulas';

function success(data: object): ResponseResolver<RestRequest, RestContext> {
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

export const server: SetupServer = setupServer(
  rest.get(
    '*/v1/courses',
    success({ courses: mockCourses })
  ),
  rest.get(
    '*/v1/courses/:courseId',
    success({ course: mockCourses[0] })
  ),

  rest.get(
    '*/v1/courses/:courseId/assessment-models',
    success({ assessmentModels: mockAssessmentModels })
  ),

  rest.get(
    '*/v1/courses/:courseId/assessment-models/:assessmentModelId/attainments',
    success({ attainment: mockAttainments })
  ),

  rest.get(
    '*/v1/courses/:courseId/instances',
    success({ courseInstances: mockInstances })
  ),

  rest.get(
    '*/v1/formulas/:formulaId',
    success({ formula: mockFormulas[0] })
  ),

  rest.get(
    '*/v1/user/:userId/courses',
    success({ courses: mockCourses })
  ),

  rest.get(
    '*/v1/sisu/courses/:courseCode',
    success({ courseInstances: mockSisuInstances })
  )
);
