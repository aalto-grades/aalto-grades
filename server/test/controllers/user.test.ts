// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';
import { CoursesOfUser } from '../../src/controllers/user';
import { HttpCode } from '../../src/types/httpCode';

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
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);

    expect(res.body.data.courses).toStrictEqual({
      'current': [
        {
          'id': 1,
          'courseCode': 'CS-A1110',
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
      ],
      'previous': []
    });
  });

  it('should not contain duplicate courses', async () => {
    const res: supertest.Response = await request.get('/v1/user/2/courses');
    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);

    const courses: CoursesOfUser = res.body.data.courses as CoursesOfUser;
    let n: number = 0;
    for (const i in courses.current) {
      if (courses.current[i].courseCode === 'CS-A1120')
        n++;
    }

    expect(n).toBe(1);
  });

  it('should contain courses from all roles', async () => {
    const res: supertest.Response = await request.get('/v1/user/4/courses');
    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);

    const courses: CoursesOfUser = res.body.data.courses as CoursesOfUser;
    expect(courses.current.length).toBe(2);
    expect(courses.previous.length).toBe(1);
  });

  it('should correctly identify whether a course is current or previous', async () => {
    const res: supertest.Response = await request.get('/v1/user/3/courses');
    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);

    const courses: CoursesOfUser = res.body.data.courses as CoursesOfUser;
    expect(courses.current.length).toBe(1);
    expect(courses.current[0].courseCode).toBe('PHYS-A1130');
    expect(courses.previous.length).toBe(1);
    expect(courses.previous[0].courseCode).toBe('TU-A1100');
  });

  it('should return fail with non-existing user id', async () => {
    const res: supertest.Response = await request.get('/v1/user/9999999/courses');
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with 400 bad request, if validation fails (non-number user id)', async () => {
    const res: supertest.Response = await request.get('/v1/user/abc/courses');
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });
});
