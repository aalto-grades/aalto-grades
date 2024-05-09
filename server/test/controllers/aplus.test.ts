// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosStatic} from 'axios';
import supertest from 'supertest';

import {AplusExerciseDataSchema, HttpCode} from '@common/types';
import {app} from '../../src/app';
import {ErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);

let cookies: Cookies = {} as Cookies;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<AxiosStatic>

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test GET /v1/aplus/courses/:aplusCourseId', () => {
  it('should respond with correct data when validation passes', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            display_name: 'First',
            exercises: [
              { difficulty: 'A' },
              { difficulty: '' }
            ]
          },
          {
            id: 2,
            display_name: 'Second',
            exercises: [
              { difficulty: '' }
            ]
          }
        ]
      }
    });

    const res = await request
      .get('/v1/aplus/courses/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await AplusExerciseDataSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if validation fails (non-number A+ course ID)', async () => {
    const res = await request
      .get('/v1/aplus/courses/abc')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .get('/v1/aplus/courses/1')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });
});
