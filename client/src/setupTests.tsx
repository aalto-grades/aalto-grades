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

import { mockCourses } from './tests/mock-data/mockCourses';
import { mockSisuInstances } from './tests/mock-data/mockSisuInstances';

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
    '*/v1/user/*/courses',
    success({ courses: mockCourses })
  ),

  rest.get(
    '*/v1/sisu/courses/*',
    success({ courseInstances: mockSisuInstances })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
