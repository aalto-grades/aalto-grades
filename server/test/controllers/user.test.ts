// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { Cookies, getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test GET /v1/user/:userId/courses - get all courses user has role in', () => {
  jest
    .spyOn(global.Date, 'now')
    .mockImplementation((): number => {
      return new Date('2022-12-10').valueOf();
    });

  it('should respond with correct data', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/1/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.courses).toStrictEqual({
      'current': [
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
          },
          'teachersInCharge': [
            {
              'id': 1,
              'name': 'Amanda Germain'
            }
          ]
        }
      ],
      'previous': []
    });
  });

  /*
   * TODO: The front page may need to be updated with teachers in charge being
   * separate from course instance roles, so these tests may need to be
   * reworked later anyway and as such they are simply disabled now.
   *
   * See: https://github.com/aalto-grades/base-repository/issues/311
   */
  /*
  it('should not contain duplicate courses', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/2/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    const courses: CoursesOfUser = res.body.data.courses as CoursesOfUser;
    let n: number = 0;
    for (const i in courses.current) {
      if (courses.current[i].courseCode === 'CS-A1120')
        n++;
    }

    expect(n).toBe(1);
  });

  it('should contain courses from all roles', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/4/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    const courses: CoursesOfUser = res.body.data.courses as CoursesOfUser;
    expect(courses.current.length).toBe(2);
    expect(courses.previous.length).toBe(1);
    });

  it('should correctly identify whether a course is current or previous', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/3/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    const courses: CoursesOfUser = res.body.data.courses as CoursesOfUser;
    expect(courses.current.length).toBe(1);
    expect(courses.current[0].courseCode).toBe('PHYS-A1130');
    expect(courses.previous.length).toBe(1);
    expect(courses.previous[0].courseCode).toBe('TU-A1100');
    });
    */

  it('should respond with 400 bad request, if validation fails (non-number user id)', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/abc/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/user/1/courses')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 404 not found, if non-existing user id', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/9999999/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
  });

});
