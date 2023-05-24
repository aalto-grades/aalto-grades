// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
let authCookie: Array<string> = [];

beforeAll(async () => {
  authCookie = await getCookies();
});

describe('Test GET /v1/courses/:courseId - get course by ID', () => {

  it('should respond with correct data when course exists', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1')
      .set('Cookie', authCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.course).toBeDefined();
    expect(res.body.data.error).not.toBeDefined();
    expect(res.body.data.course.id).toBe(1);
    expect(res.body.data.course.courseCode).toBeDefined();
    expect(res.body.data.course.department).toBeDefined();
    expect(res.body.data.course.name).toBeDefined();
    expect(res.body.data.course.evaluationInformation).toBeDefined();
  });

  it('should respond with 400 bad request, if validation fails (non-number course id)',
    async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/abc')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(res.body.success).toBe(false);
    expect(res.body.errors[0]).toBe('unauthorized');
    expect(res.body.data).not.toBeDefined();
  });

  it('should respond with 404 not found, if nonexistent course id', async () => {
    const res: supertest.Response = await request
      .get(`/v1/courses/${badId}`)
      .set('Cookie', authCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

});

describe('Test POST /v1/courses - create new course', () => {

  it('should respond with course data on correct input', async () => {
    let input: object = {
      courseCode: 'ELEC-A7200',
      department: {
        fi: 'Sähkötekniikan korkeakoulu',
        en: 'School of Electrical Engineering',
        sv: 'Högskolan för elektroteknik'
      },
      name: {
        fi: 'Signaalit ja järjestelmät',
        en: 'Signals and Systems',
        sv: ''
      }
    };
    let res: supertest.Response = await request
      .post('/v1/courses').send(input)
      .set('Cookie', authCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.course.id).toBeDefined();

    input = {
      courseCode: 'ELEC-A7200',
      department: {
        fi: 'Sähkötekniikan korkeakoulu',
        en: 'School of Electrical Engineering',
      },
      name: {
        fi: 'Signaalit ja järjestelmät',
        en: 'Signals and Systems',
      }
    };
    res = await request.post('/v1/courses')
      .send(input)
      .set('Cookie', authCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.course.id).toBeDefined();
  });

  it('should respond with 400 bad request, if required fields are undefined', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send({})
      .set('Cookie', authCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toContain('courseCode is a required field');
    expect(res.body.errors).toContain('department is a required field');
    expect(res.body.errors).toContain('name is a required field');
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send({})
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(res.body.success).toBe(false);
    expect(res.body.errors[0]).toBe('unauthorized');
    expect(res.body.data).not.toBeDefined();
  });

  /* TODO: move next test case elsewhere in future, after refactoring commonly
   * reusable functionality (e.g. middleware) to their own modules / functions
   */

  it('should respond with syntax error, if parsing request JSON fails', async () => {
    const input: string = '{"courseCode": "ELEC-A7200"';
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send(input)
      .set('Content-Type', 'application/json')
      .set('Cookie', authCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toContain(
      'SyntaxError: Unexpected end of JSON input: {"courseCode": "ELEC-A7200"'
    );
  });

});
