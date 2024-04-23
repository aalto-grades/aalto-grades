// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {BaseCourseDataSchema, HttpCode, IdpUserSchema} from '@common/types';
import {app} from '../../src/app';
import User from '../../src/database/models/user';
import {ErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);
let cookies: Cookies = {} as Cookies;

const deleteUserId = 24;

const CourseSchema = BaseCourseDataSchema.strict().refine(
  val => val.maxCredits >= val.minCredits
);

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test GET /v1/user/:userId/courses - get all courses user has role in', () => {
  it('should respond with correct data for other user (admin user)', async () => {
    const res = await request
      .get('/v1/user/2/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(CourseSchema);
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
    if (result.success) expect(result.data.length).toBeGreaterThan(0);
  });

  it('should respond with correct data for user (teacher user)', async () => {
    const res = await request
      .get('/v1/user/1/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(CourseSchema);
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();

    const res2 = await request
      .get('/v1/user/2/courses')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result2 = await Schema.safeParseAsync(res2.body);
    expect(result2.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if validation fails (non-number user id)', async () => {
    const res = await request
      .get('/v1/user/abc/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .get('/v1/user/1/courses')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden, if trying to access other users courses (not admin)', async () => {
    const res = await request
      .get('/v1/user/1/courses')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if non-existing user id', async () => {
    const res = await request
      .get('/v1/user/9999999/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test GET /v1/idp-users/ - get idp users information', () => {
  it('should respond with idp users data when querying as admin', async () => {
    const res = await request
      .get('/v1/idp-users')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(IdpUserSchema.strict());
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .get('/v1/idp-users')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden, if not admin', async () => {
    const res = await request
      .get('/v1/idp-users')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test POST /v1/idp-users/ - get idp users information', () => {
  it('should create idp user when admin', async () => {
    const res = await request
      .post('/v1/idp-users')
      .send({email: 'test.id@aalto.fi'})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const user = await User.findByEmail('test.id@aalto.fi');

    expect(JSON.stringify(res.body)).toBe('{}');
    expect(user).not.toBe(null);
  });

  it('should respond 401 unauthorized if not logged in', async () => {
    const res = await request
      .post('/v1/idp-users')
      .send({email: 'idp@user.com'})
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond 403 forbidden if not admin', async () => {
    const res = await request
      .post('/v1/idp-users')
      .send({email: 'idp@user.com'})
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test DELETE /v1/idp-users/:userId - get idp users information', () => {
  it('should delete idp user when admin', async () => {
    const res = await request
      .delete(`/v1/idp-users/${deleteUserId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const deletedUser = await User.findByPk(deleteUserId);

    expect(JSON.stringify(res.body)).toBe('{}');
    expect(deletedUser).toBe(null);
  });

  it('should respond 404 if idp user with id not found', async () => {
    const res = await request
      .delete('/v1/idp-users/99999')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond 401 unauthorized if not logged in', async () => {
    const res = await request
      .delete('/v1/idp-users/24')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond 403 forbidden if not admin', async () => {
    const res = await request
      .delete('/v1/idp-users/24')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});
