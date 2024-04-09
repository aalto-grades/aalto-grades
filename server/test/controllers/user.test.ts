// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@common/types';
import supertest from 'supertest';

import {app} from '../../src/app';
import User from '../../src/database/models/user';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);
let cookies: Cookies = {
  adminCookie: [],
  teacherCookie: [],
};

beforeAll(async () => {
  cookies = await getCookies();
});

async function testCourses(): Promise<void> {
  for (let i: number = 1; i < 20; i++) {
    const res: supertest.Response = await request
      .get(`/v1/user/${i}/courses`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].id).toBeDefined();
    expect(res.body.data[0].courseCode).toBeDefined();
    expect(res.body.data[0].minCredits).toBeDefined();
    expect(res.body.data[0].maxCredits).toBeDefined();
    expect(res.body.data[0].gradingScale).toBeDefined();
    expect(res.body.data[0].department).toBeDefined();
    expect(res.body.data[0].name).toBeDefined();
    expect(res.body.data[0].teachersInCharge).toBeDefined();
    expect(res.body.data[0].teachersInCharge[0].id).toBeDefined();
    expect(res.body.data[0].teachersInCharge[0].name).toBeDefined();
  }
}

async function testInformation(): Promise<void> {
  for (let i: number = 1; i < 20; i++) {
    const res: supertest.Response = await request
      .get(`/v1/user/${i}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.studentNumber).toBeDefined();
    expect(res.body.data.name).toBeDefined();
    expect(res.body.data.email).toBeDefined();
  }
}

describe('Test GET /v1/user/:userId/courses - get all courses user has role in', () => {
  it('should respond with correct data of any user when admin user', async () => {
    await testCourses();
  });

  it('should respond with correct data when user querying their own courses', async () => {
    // Check for user.
    let res: supertest.Response = await request
      .get('/v1/auth/self-info')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    res = await request
      .get(`/v1/user/${res.body.data.id}/courses`)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();

    // Check for admin.
    res = await request
      .get('/v1/auth/self-info')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    res = await request
      .get(`/v1/user/${res.body.data.id}/courses`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
  });

  it('should contain courses the user is in charge of', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/2502/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].courseCode).toBe('TU-A1100');
  });

  it('should contain courses where the user has an instance role', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/2503/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].courseCode).toBe('CS-A1110');
  });

  it('should not contain duplicate courses', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/2504/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].courseCode).toBe('CS-A1150');
  });

  it('should respond with 400 bad request, if validation fails (non-number user id)', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/abc/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/user/1/courses')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 403 forbidden, if trying to access other users courses (not admin)', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/1/courses')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    expect(res.body.errors[0]).toBe("cannot access user's courses");
    expect(res.body.data).not.toBeDefined();
  });

  it('should respond with 404 not found, if non-existing user id', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/9999999/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
  });
});

describe('Test GET /v1/user/:userId - get user information', () => {
  it('should respond with correct data of any user when admin user', async () => {
    await testInformation();
  });

  it('should respond with correct data when user querying their own information', async () => {
    // Check for user.
    let res: supertest.Response = await request
      .get('/v1/auth/self-info')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    res = await request
      .get(`/v1/user/${res.body.data.id}`)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();

    // Check for admin.
    res = await request
      .get('/v1/auth/self-info')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    res = await request
      .get(`/v1/user/${res.body.data.id}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
  });

  it('should respond with 400 bad request, if validation fails (non-number user id)', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/abc')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/user/1')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 403 forbidden, if trying to access other users information (not admin)', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/1')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    expect(res.body.errors[0]).toBe("cannot access user's courses");
    expect(res.body.data).not.toBeDefined();
  });

  it('should respond with 404 not found, if non-existing user id', async () => {
    const res: supertest.Response = await request
      .get('/v1/user/9999999')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
  });
});

describe('Test GET /v1/idp-users/ - get idp users information', () => {
  it('should respond with idp users data when querying as admin', async () => {
    let res: supertest.Response = await request
      .get('/v1/auth/self-info')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    res = await request
      .get('/v1/idp-users')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/idp-users')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 403 forbidden, if not admin', async () => {
    await request
      .get('/v1/auth/self-info')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    await request
      .get('/v1/idp-users')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);
  });
});

describe('Test POST /v1/idp-users/ - get idp users information', () => {
  it('should create idp user when admin', async () => {
    const res: supertest.Response = await request
      .post('/v1/idp-users')
      .send({email: 'idp@user.com'})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(res.body.errors).not.toBeDefined();
    const user = await User.findByEmail('idp@user.com');
    expect(user).not.toBe(null);
  });

  it('should respond 401 unauthorized if not logged in', async () => {
    await request
      .post('/v1/idp-users')
      .send({email: 'idp@user.com'})
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond 403 forbidden if not admin', async () => {
    await request
      .post('/v1/idp-users')
      .send({email: 'idp@user.com'})
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);
  });
});

describe('Test DELETE /v1/idp-users/:userId - get idp users information', () => {
  it('should delete idp user when admin', async () => {
    const users: Array<User> = await User.findIdpUsers();
    const deleteUserWithId = users[0].id;
    await request
      .delete(`/v1/idp-users/${deleteUserWithId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);
    const deletedUser = await User.findByPk(deleteUserWithId);
    expect(deletedUser).toBe(null);
  });

  it('should respond 404 if idp user with id not found', async () => {
    await request
      .delete('/v1/idp-users/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);
  });

  it('should respond 401 unauthorized if not logged in', async () => {
    await request
      .delete('/v1/idp-users/123')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond 401 unauthorized if not admin', async () => {
    await request
      .delete('/v1/idp-users/123')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });
});
