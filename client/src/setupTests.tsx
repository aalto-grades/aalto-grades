// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

import { mockCourses } from './tests/mock-data/mockCourses';
import { mockSisuInstances } from './tests/mock-data/mockSisuInstances';

const server = setupServer(
  rest.get('http://localhost:3000/v1/courses', async (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          courses: mockCourses
        }
      })
    );
  }),

  rest.get('http://localhost:3000/v1/user/*/courses', async (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          courses: mockCourses
        }
      })
    );
  }),

  rest.get('http://localhost:3000/v1/sisu/courses/*', async (_, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: {
          courseInstances: mockSisuInstances
        }
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
