// SPDX-FileCopyrightText: 2025 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosError, type AxiosStatic} from 'axios';
import supertest from 'supertest';

import {HttpCode, SisuCourseInstanceArraySchema} from '@/common/types';
import {app} from '../../src/app';
import {apiMockData} from '../../src/configs/sisu';
import {type Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let testCookies: [string][] = [];

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

beforeAll(async () => {
  cookies = await getCookies();

  testCookies = [
    cookies.adminCookie,
    cookies.teacherCookie,
    cookies.assistantCookie,
    cookies.studentCookie,
  ];
});

afterAll(async () => {
  await resetDb();
});

describe('Test GET v1/sisu/courses/:courseCode - get course from Sisu based on course code', () => {
  it('should respond with correct data when course exists', async () => {
    mockedAxios.get.mockResolvedValue({data: apiMockData});

    for (const cookie of testCookies) {
      const res = await request
        .get('/v1/sisu/courses/CS-A1111')
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const schema = SisuCourseInstanceArraySchema.nonempty();
      const result = schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if course code parsing fails', async () => {
    for (const cookie of testCookies) {
      await responseTests
        .testBadRequest('/v1/sisu/courses/djslkf34dfkgjdggokfpgidgfp', cookie)
        .get();
    }
  });

  it('should respond with 401 if not logged in', async () => {
    await responseTests.testUnauthorized('/v1/sisu/courses/CS-A1111').get();
  });

  it('should respond with 404 when not found', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        error: {code: 102, message: 'Course unit realisations not found'},
      },
    });

    for (const cookie of testCookies) {
      await responseTests
        .testNotFound('/v1/sisu/courses/CS-A9999', cookie)
        .get();
    }
  });

  it('should respond with 502 if Sisu request fails', async () => {
    mockedAxios.get.mockImplementation(() => {
      throw new AxiosError();
    });

    for (const cookie of testCookies) {
      await responseTests
        .testBadGateway('/v1/sisu/courses/CS-A9999', cookie)
        .get();
    }
  });
});
