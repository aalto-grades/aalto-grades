// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {BaseCourseDataSchema, HttpCode, IdpUserSchema} from '@/common/types';
import {app} from '../../src/app';
import User from '../../src/database/models/user';
import {createData} from '../util/createData';
import {ADMIN_ID, ASSISTANT_ID, STUDENT_ID, TEACHER_ID} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();
});

afterAll(async () => {
  await resetDb();
});

describe('Test GET /v1/user/:userId/courses - get all courses user has role in', () => {
  const UserCoursesSchema = BaseCourseDataSchema.strict().refine(
    val => val.maxCredits >= val.minCredits
  );

  it('should get user courses', async () => {
    await createData.createCourse({}); // Create course the student is a part of

    const testUsers: [number, string[]][] = [
      [ADMIN_ID, cookies.adminCookie],
      [TEACHER_ID, cookies.teacherCookie],
      [ASSISTANT_ID, cookies.assistantCookie],
      [STUDENT_ID, cookies.studentCookie],
    ];
    for (const [userId, cookie] of testUsers) {
      const res = await request
        .get(`/v1/user/${userId}/courses`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = z.array(UserCoursesSchema);
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should get data data for other user (admin user)', async () => {
    const res = await request
      .get(`/v1/user/${TEACHER_ID}/courses`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(UserCoursesSchema).nonempty();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/user/${'bad'}/courses`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const user = await createData.createUser();

    const url = `/v1/user/${user.id}/courses`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/user/${nonExistentId}/courses`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test GET /v1/idp-users/ - get all idp users', () => {
  it('should get all idp users', async () => {
    const res = await request
      .get('/v1/idp-users')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(IdpUserSchema.strict());
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = '/v1/idp-users';
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });
});

describe('Test POST /v1/idp-users/ - add an idp user', () => {
  it('should add idp user', async () => {
    const res = await request
      .post('/v1/idp-users')
      .send({email: 'idpuser1@aalto.fi'})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');

    const user = await User.findByEmail('idpuser1@aalto.fi');
    expect(user).not.toBe(null);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = '/v1/idp-users';
    const data = {email: 'idpuser2@aalto.fi'};
    await responseTests.testUnauthorized(url).post(data);

    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 409 when idp user with email already exists', async () => {
    const url = '/v1/idp-users';
    const data = {email: 'idpuser1@aalto.fi'};
    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });
});

describe('Test DELETE /v1/idp-users/:userId - delete an idp user', () => {
  it('should delete an idp user', async () => {
    const user = await createData.createUser();

    const res = await request
      .delete(`/v1/idp-users/${user.id}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');

    const deletedUser = await User.findByPk(user.id);
    expect(deletedUser).toBe(null);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const user = await createData.createUser();

    const url = `/v1/idp-users/${user.id}`;
    await responseTests.testUnauthorized(url).delete();

    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/idp-users/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });
});
