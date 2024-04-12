// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@common/types';
import supertest from 'supertest';

import {app} from '../../src/app';
import {ErrorSchema} from '../util/general';

const request = supertest(app);

const evaluateResponse = async (
  res: supertest.Response,
  errorMessage: string
): Promise<void> => {
  const result = await ErrorSchema.safeParseAsync(res.body);
  expect(result.success).toBeTruthy();
  if (result.success) expect(result.data.errors[0]).toBe(errorMessage);
};

describe('Test behavior to unknown endpoints', () => {
  it('should respond with 404 not found, if endpoint does not exists or HTTP method not available', async () => {
    await evaluateResponse(
      await request
        .put('/v1/auth/login')
        .set('Content-Type', 'application/json')
        .expect(HttpCode.NotFound),
      'Cannot PUT /v1/auth/login. Please refer to the API documentation at ' +
        'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.'
    );

    await evaluateResponse(
      await request
        .get('/v1/course/all')
        .set('Content-Type', 'application/json'),
      'Cannot GET /v1/course/all. Please refer to the API documentation at ' +
        'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.'
    );

    await evaluateResponse(
      await request
        .post('/v1/sisu/courses/CS-A1110')
        .set('Content-Type', 'application/json'),
      'Cannot POST /v1/sisu/courses/CS-A1110. Please refer to the API documentation at ' +
        'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.'
    );

    await evaluateResponse(
      await request
        .delete('/v1/user/1')
        .set('Content-Type', 'application/json'),
      'Cannot DELETE /v1/user/1. Please refer to the API documentation at ' +
        'https://aalto-grades.cs.aalto.fi/api-docs/ for a list of available endpoints.'
    );
  });
});
