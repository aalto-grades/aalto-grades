// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {
  CoursePartData,
  CourseTaskDataArraySchema,
  EditCourseTaskData,
  HttpCode,
  NewCourseTaskData,
} from '@/common/types';
import {app} from '../../src/app';
import CourseTask from '../../src/database/models/courseTask';
import {createData} from '../util/createData';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let coursePartId = -1;

let noRoleCourseId = -1;

const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();

  let courseParts: CoursePartData[] = [];
  [courseId, courseParts] = await createData.createCourse({});
  coursePartId = courseParts[0].id;

  [noRoleCourseId, courseParts] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
});

afterAll(async () => {
  await resetDb();
});

describe('Test GET /v1/courses/:courseId/tasks - get all course tasks', () => {
  it('should get the course tasks', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
      cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/tasks`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = CourseTaskDataArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if ID is invalid', async () => {
    const url = '/v1/courses/bad/tasks';
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url401 = `/v1/courses/${courseId}/tasks`;
    await responseTests.testUnauthorized(url401).get();

    const url403 = `/v1/courses/${noRoleCourseId}/tasks`;
    await responseTests
      .testForbidden(url403, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${nonExistentId}/tasks`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/tasks - modify course tasks', () => {
  const getNewCourseTaskId = async (): Promise<number> =>
    (await createData.createCourseTask(coursePartId)).id;

  let i = 0;
  const getCourseTaskBase = (): {
    name: string;
    daysValid: number;
    maxGrade: number;
  } => ({
    name: `testCourseTask-${i++}`,
    daysValid: i++,
    maxGrade: i++,
  });

  const getNewCourseTask = (): NewCourseTaskData => ({
    coursePartId,
    ...getCourseTaskBase(),
  });

  const getEditCourseTask = (id: number): EditCourseTaskData => ({
    id,
    ...getCourseTaskBase(),
  });

  const checkCourseTask = async (
    courseTask: NewCourseTaskData | EditCourseTaskData
  ): Promise<void> => {
    const result = await CourseTask.findOne({
      where: {
        name: courseTask.name,
        daysValid: courseTask.daysValid,
        maxGrade: courseTask.maxGrade,
      },
    });

    expect(result).not.toBeNull();
    if ('archived' in courseTask)
      expect(result?.archived).toBe(courseTask.archived);
  };

  const courseTaskDoesNotExist = async (id: number): Promise<void> => {
    const result = await CourseTask.findByPk(id);
    expect(result).toBeNull();
  };

  it('should add course tasks', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const courseTask = getNewCourseTask();

      const res = await request
        .post(`/v1/courses/${courseId}/tasks`)
        .send({add: [courseTask]})
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkCourseTask(courseTask);
    }
  });

  it('should edit course tasks', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const courseTask = getEditCourseTask(await getNewCourseTaskId());

      const res = await request
        .post(`/v1/courses/${courseId}/tasks`)
        .send({edit: [courseTask]})
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkCourseTask(courseTask);
    }
  });

  it('should delete course tasks', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const courseTaskId = await getNewCourseTaskId();

      const res = await request
        .post(`/v1/courses/${courseId}/tasks`)
        .send({delete: [courseTaskId]})
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await courseTaskDoesNotExist(courseTaskId);
    }
  });

  it('should add, edit, and delete course tasks', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const addTask = getNewCourseTask();
      const editTask = getEditCourseTask(await getNewCourseTaskId());
      const deleteId = await getNewCourseTaskId();

      const res = await request
        .post(`/v1/courses/${courseId}/tasks`)
        .send({add: [addTask], edit: [editTask], delete: [deleteId]})
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkCourseTask(addTask);
      await checkCourseTask(editTask);
      await courseTaskDoesNotExist(deleteId);
    }
  });

  it('should respond with 400 if ID is invalid', async () => {
    // TODO
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    // TODO
  });

  it('should respond with 404 when not found', async () => {
    // TODO
  });
});
