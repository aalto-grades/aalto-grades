// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;

describe('Test GET /v1/courses/:courseId', () => {
  it('should respond with correct data when course exists', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1');
    expect(res.body.success).toBe(true);
    expect(res.body.course).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.course.id).toBe(1);
    expect(res.body.course.courseCode).toBeDefined();
    expect(res.body.course.department).toBeDefined();
    expect(res.body.course.name).toBeDefined();
    expect(res.body.course.evaluationInformation).toBeDefined();
    expect(res.statusCode).toBe(200);
  });

  it('should respond with 404 not found, if non-existing course id', async () => {
    const res: supertest.Response = await request.get(`/v1/courses/${badId}`);
    expect(res.body.success).toBe(false);
    expect(res.body.course).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);
  });

  it('should respond with 400 bad request, if validation fails (non-number course id)',
    async () => {
      const res: supertest.Response = await request.get('/v1/courses/abc');
      expect(res.body.success).toBe(false);
      expect(res.body.course).not.toBeDefined();
      expect(res.body.error).toBeDefined();
      expect(res.statusCode).toBe(400);
    });
});

describe('Test POST /v1/courses', () => {

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
    let res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.course.courseCode).toBe('ELEC-A7200');
    expect(res.body.course.name).toStrictEqual({
      'fi': 'Signaalit ja järjestelmät',
      'en': 'Signals and Systems',
      'sv': ''
    });
    expect(res.body.course.department).toStrictEqual({
      'fi': 'Sähkötekniikan korkeakoulu',
      'en': 'School of Electrical Engineering',
      'sv': 'Högskolan för elektroteknik'
    });

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
    res = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.course.courseCode).toBe('ELEC-A7200');
    expect(res.body.course.name).toStrictEqual({
      'fi': 'Signaalit ja järjestelmät',
      'en': 'Signals and Systems',
      'sv': ''
    });
    expect(res.body.course.department).toStrictEqual({
      'fi': 'Sähkötekniikan korkeakoulu',
      'en': 'School of Electrical Engineering',
      'sv': ''
    });
  });

  it('should respond with validation errors, if required fields are undefined', async () => {
    const input: object = {};
    const res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('courseCode is a required field');
    expect(res.body.errors).toContain('department is a required field');
    expect(res.body.errors).toContain('name is a required field');
  });

  /* TODO: move next test case elsewhere in future, after refactoring commonly
   * reusable functionality (e.g. middleware) to their own modules / functions
   */

  it('should respond with syntax error, if parsing request JSON fails', async () => {
    const input: string = '{"courseCode": "ELEC-A7200"';
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send(input)
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain(
      'SyntaxError: Unexpected end of JSON input: {"courseCode": "ELEC-A7200"'
    );
  });
});
