// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

import { ResponseComposition, ResponseResolver, rest, RestContext, RestRequest } from 'msw';
import { setupServer, SetupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { mockAssessmentModels } from './tests/mock-data/mockAssessmentModels';
import { mockAttainments } from './tests/mock-data/mockAttainments';
import { mockCourses } from './tests/mock-data/mockCourses';
import { mockFinalGrades } from './tests/mock-data/mockFinalGrades';
import { mockInstances } from './tests/mock-data/mockInstancesWithStringDates';
import { mockSisuInstances } from './tests/mock-data/mockSisuInstances';
import { mockFormulas } from './tests/mock-data/mockFormulas';

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

const server: SetupServer = setupServer(
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

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
