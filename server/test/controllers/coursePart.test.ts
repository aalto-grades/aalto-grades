// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {
  type CoursePartData,
  CoursePartDataArraySchema,
  type EditCoursePartData,
  HttpCode,
  IdSchema,
  type NewCoursePartData,
} from '@/common/types';
import {app} from '../../src/app';
import CoursePart from '../../src/database/models/coursePart';
import {createData} from '../util/createData';
import {NEXT_YEAR, TEACHER_ID, convertDate} from '../util/general';
import {type Cookies, getCookies} from '../util/getCookies';
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
  const result = await CoursePart.findOne({
    where: {id, courseId: courseId},
  });

  expect(result).not.toBe(null);
  if (coursePart.name !== undefined) expect(result?.name).toBe(coursePart.name);

  if (coursePart.expiryDate === null) expect(result?.expiryDate).toBeNull();

  if (coursePart.expiryDate) {
    expect(result?.expiryDate).toBeTruthy();
    if (result?.expiryDate)
      expect(new Date(result.expiryDate)).toEqual(
        convertDate(coursePart.expiryDate)
      );
  }
};

const coursePartDoesNotExist = async (id: number): Promise<void> => {
  const result = await CoursePart.findOne({
    where: {id: id, courseId: courseId},
  });
  expect(result).toBeNull();
};

describe('Test GET /v1/courses/:courseId/parts - get all course parts', () => {
  it('should get the course parts', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
      cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/parts`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = CoursePartDataArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if ID is invalid', async () => {
    const url = '/v1/courses/bad/parts';
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/parts`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(`/v1/courses/${noRoleCourseId}/parts`, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${nonExistentId}/parts`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/parts - add a course part', () => {
  it('should add a course part', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    let i = 0;

    for (const cookie of testCookies) {
      const coursePart: NewCoursePartData = {
        name: `source-${++i}`,
        expiryDate: NEXT_YEAR,
      };
      const res = await request
        .post(`/v1/courses/${courseId}/parts`)
        .send(coursePart)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      const result = IdSchema.safeParse(res.body);
      expect(result.success).toBeTruthy();
      if (result.success) await checkCoursePart(result.data, coursePart);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = '/v1/courses/bad/parts';
    const data: NewCoursePartData = {name: 'not added', expiryDate: NEXT_YEAR};
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/parts`;
    const data = {name: 'not added', daysValid: 365, maxGrade: 5};
    await responseTests.testUnauthorized(url).post(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .post(data);

    url = `/v1/courses/${noRoleCourseId}/parts`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/courses/${nonExistentId}/parts`;
    const data: NewCoursePartData = {name: 'not added', expiryDate: NEXT_YEAR};
    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 409 if trying to create a course part with duplicate name', async () => {
    const url = `/v1/courses/${courseId}/parts`;
    const data: NewCoursePartData = {name: 'source-1', expiryDate: NEXT_YEAR};
    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });
});

describe('Test PUT /v1/courses/:courseId/parts/:coursePartId - edit a course part', () => {
  it('should edit a course part', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    let i = 0;

    for (const cookie of testCookies) {
      const coursePart: EditCoursePartData = {
        name: `edit${++i}`,
        expiryDate: NEXT_YEAR,
      };
      const res = await request
        .put(`/v1/courses/${courseId}/parts/${editCoursePartId}`)
        .send(coursePart)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkCoursePart(editCoursePartId, coursePart);
    }
  });

  it('should partially edit a course part', async () => {
    const data: EditCoursePartData[] = [
      {name: 'edit1 new'},
      {expiryDate: NEXT_YEAR},
    ];
    for (const editData of data) {
      const res = await request
        .put(`/v1/courses/${courseId}/parts/${editCoursePartId}`)
        .send(editData)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.teacherCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkCoursePart(editCoursePartId, editData);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/bad/parts/${editCoursePartId}`;
    const data: EditCoursePartData = {
      name: 'not edited',
      expiryDate: NEXT_YEAR,
    };
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${courseId}/parts/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/parts/${editCoursePartId}`;
    const data: EditCoursePartData = {
      name: 'not edited',
      expiryDate: NEXT_YEAR,
    };
    await responseTests.testUnauthorized(url).put(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .put(data);

    url = `/v1/courses/${noRoleCourseId}/parts/${noRoleCoursePartId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${nonExistentId}/parts/${editCoursePartId}`;
    const data: EditCoursePartData = {
      name: 'not edited',
      expiryDate: NEXT_YEAR,
    };
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${courseId}/parts/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 when course part does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/parts/${noRoleCoursePartId}`;
    const data: EditCoursePartData = {
      name: 'not edited',
      expiryDate: NEXT_YEAR,
    };
    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 when trying to edit duplicate course part name', async () => {
    const url = `/v1/courses/${courseId}/parts/${editCoursePartId}`;
    const data: EditCoursePartData = {name: 'source-1', expiryDate: NEXT_YEAR};
    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });
});

describe('Test Delete /v1/courses/:courseId/parts/:coursePartId - delete a course part', () => {
  it('should delete a course part', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const coursePart = await createData.createCoursePart(courseId);

      const res = await request
        .delete(`/v1/courses/${courseId}/parts/${coursePart.id}`)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await coursePartDoesNotExist(coursePart.id);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/bad/parts/${editCoursePartId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();

    url = `/v1/courses/${courseId}/parts/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/parts/${editCoursePartId}`;
    await responseTests.testUnauthorized(url).delete();

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .delete();

    url = `/v1/courses/${noRoleCourseId}/parts/${noRoleCoursePartId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${nonExistentId}/parts/${editCoursePartId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();

    url = `/v1/courses/${courseId}/parts/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 when course part does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/parts/${noRoleCoursePartId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 if trying to delete a course part with grades', async () => {
    const coursePart = await createData.createCoursePart(courseId);
    const courseTask = await createData.createCourseTask(coursePart.id);
    const user = await createData.createUser();
    await createData.createGrade(user.id, courseTask.id, TEACHER_ID);

    const url = `/v1/courses/${courseId}/parts/${coursePart.id}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();

    await checkCoursePart(coursePart.id, {}); // Validate that still exists
  });
});
