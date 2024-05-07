// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {
  AttainmentData,
  AttainmentDataSchema,
  EditAttainmentData,
  HttpCode,
  IdSchema,
  NewAttainmentData,
} from '@common/types';
import {app} from '../../src/app';
import Attainment from '../../src/database/models/attainment';
import {createData} from '../util/createData';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let editAttainmentId = -1;

let noRoleCourseId = -1;
let noRoleAttainmentId = 26;

const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();

  let courseAttainments: AttainmentData[] = [];
  [courseId, courseAttainments] = await createData.createCourse({});
  editAttainmentId = courseAttainments[0].id;

  [noRoleCourseId, courseAttainments] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  noRoleAttainmentId = courseAttainments[0].id;
});

afterAll(async () => {
  await resetDb();
});

const checkAttainment = async (
  id: number,
  attainment: NewAttainmentData | EditAttainmentData
): Promise<void> => {
  const result = await Attainment.findOne({
    where: {id, courseId: courseId},
  });

  expect(result).not.toBe(null);
  if (attainment.name !== undefined) expect(result?.name).toBe(attainment.name);
  if (attainment.daysValid !== undefined)
    expect(result?.daysValid).toBe(attainment.daysValid);
};

const attainmentDoesNotExist = async (id: number): Promise<void> => {
  const result = await Attainment.findOne({
    where: {id: id, courseId: courseId},
  });
  expect(result).toBeNull();
};

describe('Test GET /v1/courses/:courseId/attainments - get attainments', () => {
  it('should get the attainments succesfully (admin user)', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
      cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/attainments`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = z.array(AttainmentDataSchema.strict()).nonempty();
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${'bad'}/attainments`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/attainments`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(`/v1/courses/${noRoleCourseId}/attainments`, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${nonExistentId}/attainments`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/attainments - add an attainment', () => {
  it('should add new attainment', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    let i = 0;

    for (const cookie of testCookies) {
      const attainment = {name: `att-${++i}`, daysValid: 350};
      const res = await request
        .post(`/v1/courses/${courseId}/attainments`)
        .send(attainment)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      const result = await IdSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
      if (result.success) await checkAttainment(result.data, attainment);
    }
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/attainments`;
    const data = {name: 'not added', daysValid: -1};
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${'bad'}/attainments`;
    const data = {name: 'not added', daysValid: 365};
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/attainments`;
    const data = {name: 'not added', daysValid: 365};
    await responseTests.testUnauthorized(url).post(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .post(data);

    url = `/v1/courses/${noRoleCourseId}/attainments`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 404 not found when course does not exist', async () => {
    const url = `/v1/courses/${nonExistentId}/attainments`;
    const data = {name: 'not added', daysValid: 365};
    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });
});

describe('Test PUT /v1/courses/:courseId/attainments/:attainmentId - edit an attainment', () => {
  it('should edit attainment', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    let i = 0;

    for (const cookie of testCookies) {
      const attainment = {name: `edit${++i}`, daysValid: 100};
      const res = await request
        .put(`/v1/courses/${courseId}/attainments/${editAttainmentId}`)
        .send(attainment)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkAttainment(editAttainmentId, attainment);
    }
  });

  it('should partially edit an attainment when course exists (teacher in charge)', async () => {
    const data: EditAttainmentData[] = [{name: 'edit1 new'}, {daysValid: 80}];
    for (const editData of data) {
      const res = await request
        .put(`/v1/courses/${courseId}/attainments/${editAttainmentId}`)
        .send(editData)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.teacherCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkAttainment(editAttainmentId, editData);
    }
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/attainments/${editAttainmentId}`;
    const data = {name: 'not edited', daysValid: -1};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${'bad'}/attainments/${editAttainmentId}`;
    const data = {name: 'not edited', daysValid: 365};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${courseId}/attainments/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/attainments/${editAttainmentId}`;
    const data = {name: 'not edited', daysValid: 365};
    await responseTests.testUnauthorized(url).put(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .put(data);

    url = `/v1/courses/${noRoleCourseId}/attainments/${noRoleAttainmentId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 not found when course/attainment does not exist', async () => {
    let url = `/v1/courses/${nonExistentId}/attainments/${editAttainmentId}`;
    const data = {name: 'not edited', daysValid: 365};
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${courseId}/attainments/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 conflict when attainment does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/attainments/${noRoleAttainmentId}`;
    const data = {name: 'not edited', daysValid: 365};
    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });
});

describe('Test Delete /v1/courses/:courseId/attainments/:attainmentId - delete an attainment', () => {
  it('should delete attainment', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const attainment = await createData.createAttainment(courseId);
      await checkAttainment(attainment.id, {}); // Validate that exists

      const res = await request
        .delete(`/v1/courses/${courseId}/attainments/${attainment.id}`)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await attainmentDoesNotExist(attainment.id);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${'bad'}/attainments/${editAttainmentId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();

    url = `/v1/courses/${courseId}/attainments/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/attainments/${editAttainmentId}`;
    await responseTests.testUnauthorized(url).delete();

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .delete();

    url = `/v1/courses/${noRoleCourseId}/attainments/${noRoleAttainmentId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 not found when course/attainment does not exist', async () => {
    let url = `/v1/courses/${nonExistentId}/attainments/${editAttainmentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();

    url = `/v1/courses/${courseId}/attainments/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 conflict when attainment does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/attainments/${noRoleAttainmentId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });
});
