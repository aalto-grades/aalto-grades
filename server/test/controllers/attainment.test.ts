// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {
  CoursePartData,
  CoursePartDataSchema,
  EditCoursePartData,
  HttpCode,
  IdSchema,
  NewCoursePartData,
} from '@/common/types';
import {app} from '../../src/app';
import Attainment from '../../src/database/models/attainment';
import {createData} from '../util/createData';
import {TEACHER_ID} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let editCoursePartId = -1;

let noRoleCourseId = -1;
let noRoleCoursePartId = 26;

const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();

  let courseParts: CoursePartData[] = [];
  [courseId, courseParts] = await createData.createCourse({});
  editCoursePartId = courseParts[0].id;

  [noRoleCourseId, courseParts] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  noRoleCoursePartId = courseParts[0].id;
});

afterAll(async () => {
  await resetDb();
});

const checkCoursePart = async (
  id: number,
  coursePart: NewCoursePartData | EditCoursePartData
): Promise<void> => {
  const result = await Attainment.findOne({
    where: {id, courseId: courseId},
  });

  expect(result).not.toBe(null);
  if (coursePart.name !== undefined) expect(result?.name).toBe(coursePart.name);
  if (coursePart.daysValid !== undefined)
    expect(result?.daysValid).toBe(coursePart.daysValid);
};

const coursePartDoesNotExist = async (id: number): Promise<void> => {
  const result = await Attainment.findOne({
    where: {id: id, courseId: courseId},
  });
  expect(result).toBeNull();
};

describe('Test GET /v1/courses/:courseId/course-parts - get all course parts', () => {
  it('should get the course parts', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
      cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/course-parts`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = z.array(CoursePartDataSchema.strict()).nonempty();
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${'bad'}/course-parts`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/course-parts`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(`/v1/courses/${noRoleCourseId}/course-parts`, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${nonExistentId}/course-parts`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/course-parts - add a course part', () => {
  it('should add a course part', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    let i = 0;

    for (const cookie of testCookies) {
      const coursePart = {name: `coursepart-${++i}`, daysValid: 350};
      const res = await request
        .post(`/v1/courses/${courseId}/course-parts`)
        .send(coursePart)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      const result = await IdSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
      if (result.success) await checkCoursePart(result.data, coursePart);
    }
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/course-parts`;
    const data = {name: 'not added', daysValid: -1};
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${'bad'}/course-parts`;
    const data = {name: 'not added', daysValid: 365};
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/course-parts`;
    const data = {name: 'not added', daysValid: 365};
    await responseTests.testUnauthorized(url).post(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .post(data);

    url = `/v1/courses/${noRoleCourseId}/course-parts`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/courses/${nonExistentId}/course-parts`;
    const data = {name: 'not added', daysValid: 365};
    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 409 if trying to create a course part with duplicate name', async () => {
    const url = `/v1/courses/${courseId}/course-parts`;
    const data = {name: 'att-1', daysValid: 365};
    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });
});

describe('Test PUT /v1/courses/:courseId/course-parts/:coursePartId - edit a course part', () => {
  it('should edit a course part', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    let i = 0;

    for (const cookie of testCookies) {
      const coursePart = {name: `edit${++i}`, daysValid: 100};
      const res = await request
        .put(`/v1/courses/${courseId}/course-parts/${editCoursePartId}`)
        .send(coursePart)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkCoursePart(editCoursePartId, coursePart);
    }
  });

  it('should partially edit a course part', async () => {
    const data: EditCoursePartData[] = [{name: 'edit1 new'}, {daysValid: 80}];
    for (const editData of data) {
      const res = await request
        .put(`/v1/courses/${courseId}/course-parts/${editCoursePartId}`)
        .send(editData)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.teacherCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkCoursePart(editCoursePartId, editData);
    }
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/course-parts/${editCoursePartId}`;
    const data = {name: 'not edited', daysValid: -1};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${'bad'}/course-parts/${editCoursePartId}`;
    const data = {name: 'not edited', daysValid: 365};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${courseId}/course-parts/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/course-parts/${editCoursePartId}`;
    const data = {name: 'not edited', daysValid: 365};
    await responseTests.testUnauthorized(url).put(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .put(data);

    url = `/v1/courses/${noRoleCourseId}/course-parts/${noRoleCoursePartId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${nonExistentId}/course-parts/${editCoursePartId}`;
    const data = {name: 'not edited', daysValid: 365};
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${courseId}/course-parts/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 when course part does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/course-parts/${noRoleCoursePartId}`;
    const data = {name: 'not edited', daysValid: 365};
    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 when trying to edit duplicate course part name', async () => {
    const url = `/v1/courses/${courseId}/course-parts/${editCoursePartId}`;
    const data = {name: 'att-1', daysValid: 365};
    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });
});

describe('Test Delete /v1/courses/:courseId/course-parts/:coursePartId - delete a course part', () => {
  it('should delete a course part', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const coursePart = await createData.createCoursePart(courseId);
      await checkCoursePart(coursePart.id, {}); // Validate that exists

      const res = await request
        .delete(`/v1/courses/${courseId}/course-parts/${coursePart.id}`)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await coursePartDoesNotExist(coursePart.id);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${'bad'}/course-parts/${editCoursePartId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();

    url = `/v1/courses/${courseId}/course-parts/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/course-parts/${editCoursePartId}`;
    await responseTests.testUnauthorized(url).delete();

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .delete();

    url = `/v1/courses/${noRoleCourseId}/course-parts/${noRoleCoursePartId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${nonExistentId}/course-parts/${editCoursePartId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();

    url = `/v1/courses/${courseId}/course-parts/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 when course part does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/course-parts/${noRoleCoursePartId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 if trying to delete a course part with grades', async () => {
    const coursePart = await createData.createCoursePart(courseId);
    await checkCoursePart(coursePart.id, {}); // Validate that exists
    const user = await createData.createUser();
    await createData.createGrade(user.id, coursePart.id, TEACHER_ID);

    const url = `/v1/courses/${courseId}/course-parts/${coursePart.id}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });
});
