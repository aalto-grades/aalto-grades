// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { HttpCode } from 'aalto-grades-common/types';
import supertest from 'supertest';

import { app } from '../../src/app';
import { Cookies, getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test GET /v1/courses/:courseId - get course by ID', () => {

  it('should respond with correct data when course exists', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.courseCode).toBeDefined();
    expect(res.body.data.minCredits).toBeDefined();
    expect(res.body.data.maxCredits).toBeDefined();
    expect(res.body.data.department).toBeDefined();
    expect(res.body.data.name).toBeDefined();
    expect(res.body.data.evaluationInformation).toBeDefined();
  });

  it('should respond with 400 bad request, if validation fails (non-number course id)',
    async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/abc')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/courses/1')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 404 not found, if nonexistent course id', async () => {
    const res: supertest.Response = await request
      .get(`/v1/courses/${badId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

});


describe('Test GET /v1/courses - get all courses', () => {

  it('should respond with correct data', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].id).toBeDefined();
    expect(res.body.data[0].courseCode).toBeDefined();
    expect(res.body.data[0].minCredits).toBeDefined();
    expect(res.body.data[0].maxCredits).toBeDefined();
    expect(res.body.data[0].department).toBeDefined();
    expect(res.body.data[0].name).toBeDefined();
    expect(res.body.data[0].evaluationInformation).toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/courses')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

});

describe('Test POST /v1/courses - create new course', () => {

  it('should respond with course ID on correct input (admin user)', async () => {
    let input: object = {
      courseCode: 'ELEC-A7200',
      minCredits: 5,
      maxCredits: 5,
      teachersInCharge: [
        {
          email: 'thomas.siegel@aalto.fi'
        }
      ],
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
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();

    input = {
      courseCode: 'ELEC-A7200',
      minCredits: 5,
      maxCredits: 5,
      teachersInCharge: [
        {
          email: 'thomas.siegel@aalto.fi'
        },
        {
          email: 'arthur.james@aalto.fi'
        }
      ],
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
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
  });

  it('should respond with 400 bad request, if required fields are undefined', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send({})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toContain('courseCode is a required field');
    expect(res.body.errors).toContain('department is a required field');
    expect(res.body.errors).toContain('name is a required field');
    expect(res.body.errors).toContain('minCredits is a required field');
    expect(res.body.errors).toContain('teachersInCharge is a required field');
    expect(res.body.errors).toContain('name is a required field');
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .post('/v1/courses')
      .send({})
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 403 forbidden, if not admin user', async () => {
    await request
      .post('/v1/courses')
      .send({})
      .set('Cookie', cookies.userCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);
  });

  it('should respond with 404 not found, if teacher email not found from database', async () => {
    const input: object = {
      courseCode: 'ELEC-A7200',
      minCredits: 5,
      maxCredits: 5,
      teachersInCharge: [
        {
          email: 'not.found@aalto.fi'
        }
      ],
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

    const res: supertest.Response = await request
      .post('/v1/courses').send(input)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0]).toBe('No user with email address not.found@aalto.fi found');
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
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toContain(
      'SyntaxError: Unexpected end of JSON input: {"courseCode": "ELEC-A7200"'
    );
  });

});
