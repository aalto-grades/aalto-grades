// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {
  CourseDataArraySchema,
  CourseRoleType,
  CourseWithFinalGradesArraySchema,
  HttpCode,
  NewUserResponseSchema,
  UserDataArraySchema,
  UserDataSchema,
  UserWithRoleArraySchema,
} from '@/common/types';
import {app} from '../../src/app';
import User from '../../src/database/models/user';
import {createData} from '../util/createData';
import {STUDENT_ID, TEACHER_ID} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let noTeachersCourseId = -1;
let noTeachersUserId = -1;
const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();

  const [courseId, , modelId] = await createData.createCourse({}); // Create course the student is a part of
  await createData.createFinalGrade(courseId, STUDENT_ID, modelId, TEACHER_ID);

  let noTeacherModelId;
  [noTeachersCourseId, , noTeacherModelId] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: true,
  });
  noTeachersUserId = (await createData.createUser()).id;
  const otherTeacherId = (await createData.createUser({name: 'Other Teacher'}))
    .id;
  await createData.createRole(
    noTeachersCourseId,
    noTeachersUserId,
    CourseRoleType.Student
  );
  await createData.createRole(
    noTeachersCourseId,
    otherTeacherId,
    CourseRoleType.Teacher
  );
  await createData.createFinalGrade(
    noTeachersCourseId,
    noTeachersUserId,
    noTeacherModelId,
    otherTeacherId
  );
});

afterAll(async () => {
  await resetDb();
});

describe('Test GET /v1/user/courses - get all courses user has role in', () => {
  it('should get user courses', async () => {
    await createData.createCourse({}); // Create course the student is a part of

    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
      cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get('/v1/user/courses')
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema =
        cookie === cookies.adminCookie
          ? CourseDataArraySchema.length(0)
          : CourseDataArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 401 if not authorized', async () => {
    const url = '/v1/user/courses';
    await responseTests.testUnauthorized(url).get();
  });
});

describe('Test GET /v1/user/:userId/grades - get all courses and grades of user where the requester has a role', () => {
  it('should get user grades', async () => {
    const testCookies: [string[], number][] = [
      [cookies.adminCookie, STUDENT_ID],
      [cookies.teacherCookie, STUDENT_ID],
      [cookies.assistantCookie, STUDENT_ID],
      [cookies.studentCookie, STUDENT_ID],
      [cookies.adminCookie, noTeachersUserId],
    ];
    for (const [cookie, userId] of testCookies) {
      const res = await request
        .get(`/v1/user/${userId}/grades`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = CourseWithFinalGradesArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should not get user grades when not allowed', async () => {
    const testCookies = [
      cookies.teacherCookie,
      cookies.assistantCookie,
      cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/user/${noTeachersUserId}/grades`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = CourseWithFinalGradesArraySchema.length(0);
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if invalid', async () => {
    const url = `/v1/user/${'bad'}/grades`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 if not authorized', async () => {
    const url = `/v1/user/${noTeachersUserId}/grades`;
    await responseTests.testUnauthorized(url).get();
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/user/${nonExistentId}/grades`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test GET /v1/students - get all students from courses where the requester has a role', () => {
  const AssistantUserSchema = UserDataSchema.extend({
    name: z.literal(null),
    email: z.literal(null),
  }).strict();

  it('should get students', async () => {
    const testCookies: [string[], z.ZodSchema][] = [
      [cookies.adminCookie, UserDataSchema],
      [cookies.teacherCookie, UserDataSchema],
      [cookies.assistantCookie, AssistantUserSchema],
    ];
    for (const [cookie, UserSchema] of testCookies) {
      const res = await request
        .get('/v1/students')
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = z.array(UserSchema).nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should not get students if requester has no roles', async () => {
    const res = await request
      .get('/v1/students')
      .set('Cookie', cookies.studentCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = UserDataArraySchema.length(0);
    const result = Schema.safeParse(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 if not authorized', async () => {
    const url = '/v1/students';
    await responseTests.testUnauthorized(url).get();
  });
});

describe('Test GET /v1/users/ - get all users', () => {
  it('should get all users', async () => {
    const res = await request
      .get('/v1/users')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = UserWithRoleArraySchema.nonempty();
    const result = Schema.safeParse(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = '/v1/users';
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

describe('Test POST /v1/users/ - add a user', () => {
  it('should add a user', async () => {
    const res = await request
      .post('/v1/users')
      .send({admin: false, email: 'idpuser1@aalto.fi'})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const result = NewUserResponseSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
    if (result.success) expect(result.data.temporaryPassword).toBeNull();

    const user = await User.findByEmail('idpuser1@aalto.fi');
    expect(user).not.toBe(null);
  });

  it('should add an admin user', async () => {
    const res = await request
      .post('/v1/users')
      .send({admin: true, email: 'admin2@aalto.fi', name: 'admin2'})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const result = NewUserResponseSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
    if (result.success) {
      const Schema = z.string().regex(/^[a-zA-Z\d]{16}$/);
      const result2 = Schema.safeParse(result.data.temporaryPassword);
      expect(result2.success);
    }

    const user = await User.findByEmail('idpuser1@aalto.fi');
    expect(user).not.toBe(null);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = '/v1/users';
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

  it('should respond with 409 when user with email already exists', async () => {
    const url = '/v1/users';
    const data = {admin: false, email: 'idpuser1@aalto.fi'};
    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });
});

describe('Test DELETE /v1/users/:userId - delete a user', () => {
  it('should delete a user', async () => {
    const user = await createData.createUser();

    const res = await request
      .delete(`/v1/users/${user.id}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');

    const deletedUser = await User.findByPk(user.id);
    expect(deletedUser).toBe(null);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const user = await createData.createUser();

    const url = `/v1/users/${user.id}`;
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
    const url = `/v1/users/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });
});
