// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@common/types';
import supertest from 'supertest';

import {app} from '../../src/app';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

function evaluateResponse(res: supertest.Response, errorMessage: string): void {
  expect(res.body.success).toBeFalsy();
  expect(res.body.errors).toBeDefined();
  expect(res.body.data).not.toBeDefined();
  expect(res.body.errors[0]).toBe(errorMessage);
  expect(res.statusCode).toBe(HttpCode.NotFound);
}

describe('Test behavior to unknown endpoints', () => {
  it('should respond with 404 not found, if endpoint does not exists or HTTP method not available', async () => {
    evaluateResponse(
      await request
        .put('/v1/auth/login')
        .set('Content-Type', 'application/json'),
      'Cannot PUT /v1/auth/login. Please refer to the API documentation at ' +
        'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.'
    );

    evaluateResponse(
      await request
        .get('/v1/course/all')
        .set('Content-Type', 'application/json'),
      'Cannot GET /v1/course/all. Please refer to the API documentation at ' +
        'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.'
    );

    evaluateResponse(
      await request
        .post('/v1/sisu/courses/CS-A1110')
        .set('Content-Type', 'application/json'),
      'Cannot POST /v1/sisu/courses/CS-A1110. Please refer to the API documentation at ' +
        'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.'
    );

    evaluateResponse(
      await request
        .delete('/v1/user/1')
        .set('Content-Type', 'application/json'),
      'Cannot DELETE /v1/user/1. Please refer to the API documentation at ' +
        'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.'
    );
  });
});
