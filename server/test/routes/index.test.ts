// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from '../../src/app';
import { TeacherCourseData } from '../../src/controllers/user';
import supertest from 'supertest';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test GET /v1/user/:userId/courses', () => {
  jest
    .spyOn(global.Date, 'now')
    .mockImplementation((): number => {
      return new Date('2022-12-10').valueOf();
    });

  it('should respond with correct data', async () => {
    const res: supertest.Response = await request.get('/v1/user/1/courses');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);

    expect(res.body.courses).toStrictEqual({
      'current': [],
      'previous': [
        {
          'id': 1,
          'courseCode': 'CS-A1110',
          'minCredits': 5,
          'maxCredits': 5,
          'department': {
            'fi': 'Tietotekniikan laitos',
            'sv': 'Institutionen för datateknik',
            'en': 'Department of Computer Science'
          },
          'name': {
            'fi': 'Ohjelmointi 1',
            'sv': 'Programmering 1',
            'en': 'Programming 1'
          },
          'evaluationInformation': {
            'fi': '',
            'sv': '',
            'en': ''
          }
        }
      ]
    });
  });

  it('should not contain duplicate courses', async () => {
    const res: supertest.Response = await request.get('/v1/user/2/courses');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);

    const courses: TeacherCourseData = res.body.courses as TeacherCourseData;
    let n: number = 0;
    for (const i in courses.current) {
      if (courses.current[i].courseCode === 'CS-A1120')
        n++;
    }

    expect(n).toBe(1);
  });

  it('should correctly identify whether a course is current or previous', async () => {
    const res: supertest.Response = await request.get('/v1/user/3/courses');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);

    const courses: TeacherCourseData = res.body.courses as TeacherCourseData;
    expect(courses.current.length).toBe(1);
    expect(courses.current[0].courseCode).toBe('PHYS-A1130');
    expect(courses.previous.length).toBe(1);
    expect(courses.previous[0].courseCode).toBe('TU-A1100');
  });
});

describe('Test POST /v1/courses', () => {

  it('should respond with course data on correct input', async () => {
    const input: object = {
      courseCode: 'ELEC-A7200',
      minCredits: 3,
      maxCredits: 5
    };
    const res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseCode).toBe('ELEC-A7200');
    expect(res.body.data.minCredits).toBe(3);
    expect(res.body.data.maxCredits).toBe(5);
    expect(Date.parse(res.body.data.createdAt)).toBeGreaterThanOrEqual(0);
  });

  it('should respond with validation error, if maxCredits is less than minCredits', async () => {
    const input: object = {
      courseCode: 'ELEC-A7200',
      minCredits: 3,
      maxCredits: 1
    };
    const res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('maxCredits must be greater than or equal to 3');
  });

  it('should respond with validation error, if minCredits is less than 0', async () => {
    const input: object = {
      courseCode: 'ELEC-A7200',
      minCredits: -1,
      maxCredits: 5
    };
    const res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('minCredits must be greater than or equal to 0');
  });

  it('should respond with validation errors, if value types are invalid', async () => {
    const input: object = {
      courseCode: 123,
      minCredits: 'asdf',
      maxCredits: 'asdf'
    };
    const res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('courseCode must be a `string` type, but the final value was: `123`.');
    expect(res.body.errors).toContain('minCredits must be a `number` type, but the final value was: `NaN` (cast from the value `"asdf"`).');
    expect(res.body.errors).toContain('maxCredits must be a `number` type, but the final value was: `NaN` (cast from the value `"asdf"`).');
  });

  it('should respond with validation errors, if required fields are missing', async () => {
    const input: object = {};
    const res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('courseCode is a required field');
    expect(res.body.errors).toContain('minCredits is a required field');
    expect(res.body.errors).toContain('maxCredits is a required field');
  });

  it('should respond with syntax error, if parsing request JSON fails', async() => {
    const input: string = '{"courseCode": "ELEC-A7200"';
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send(input)
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('SyntaxError: Unexpected end of JSON input: {"courseCode": "ELEC-A7200"');
  });

});
