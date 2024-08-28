// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {
  CoursePartData,
  CourseTaskData,
  CourseTaskDataArraySchema,
  EditCourseTaskData,
  HttpCode,
  IdArraySchema,
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

let differentCoursePartId = -1;
let differentCourseTaskId = -1;

const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();

  let courseParts: CoursePartData[] = [];
  [courseId, courseParts] = await createData.createCourse({});
  coursePartId = courseParts[0].id;

  let courseTasks: CourseTaskData[] = [];
  [noRoleCourseId, courseParts, courseTasks] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  differentCoursePartId = courseParts[0].id;
  differentCourseTaskId = courseTasks[0].id;
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

  const getAddCourseTask = (): NewCourseTaskData => ({
    coursePartId,
    ...getCourseTaskBase(),
  });

  const getEditCourseTask = async (): Promise<EditCourseTaskData> => ({
    id: (await createData.createCourseTask(coursePartId)).id,
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
      const courseTask = getAddCourseTask();

      const res = await request
        .post(`/v1/courses/${courseId}/tasks`)
        .send({add: [courseTask]})
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = IdArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
      await checkCourseTask(courseTask);
    }
  });

  it('should edit course tasks', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const courseTask = await getEditCourseTask();

      const res = await request
        .post(`/v1/courses/${courseId}/tasks`)
        .send({edit: [courseTask]})
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = IdArraySchema.safeParse(res.body);
      expect(result.success).toBeTruthy();
      await checkCourseTask(courseTask);
    }
  });

  it('should delete course tasks', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const courseTaskId = (await createData.createCourseTask(coursePartId)).id;

      const res = await request
        .post(`/v1/courses/${courseId}/tasks`)
        .send({delete: [courseTaskId]})
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = IdArraySchema.safeParse(res.body);
      expect(result.success).toBeTruthy();
      await courseTaskDoesNotExist(courseTaskId);
    }
  });

  it('should add, edit, and delete course tasks', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const addTask = getAddCourseTask();
      const editTask = await getEditCourseTask();
      const deleteId = (await createData.createCourseTask(coursePartId)).id;

      const res = await request
        .post(`/v1/courses/${courseId}/tasks`)
        .send({add: [addTask], edit: [editTask], delete: [deleteId]})
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = IdArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
      await checkCourseTask(addTask);
      await checkCourseTask(editTask);
      await courseTaskDoesNotExist(deleteId);
    }
  });

  it('should respond with 400 if ID is invalid', async () => {
    const url = '/v1/courses/bad/tasks';
    await responseTests.testBadRequest(url, cookies.adminCookie).post({});
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/tasks`;
    await responseTests
      .testBadRequest(url, cookies.adminCookie)
      .post({bad: []});
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url401 = `/v1/courses/${courseId}/tasks`;
    await responseTests.testUnauthorized(url401).post({});

    const url403 = `/v1/courses/${noRoleCourseId}/tasks`;
    await responseTests
      .testForbidden(url403, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post({});
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${courseId}/tasks`;

    const urlCourseNotFound = `/v1/courses/${nonExistentId}/tasks`;
    await responseTests
      .testNotFound(urlCourseNotFound, cookies.adminCookie)
      .post({});

    const invalid = [
      {add: [{...getAddCourseTask(), coursePartId: nonExistentId}]},
      {edit: [{...(await getEditCourseTask()), id: nonExistentId}]},
      {delete: [nonExistentId]},
    ];

    for (const input of invalid) {
      await responseTests.testNotFound(url, cookies.adminCookie).post(input);
    }
  });

  it('should respond with 409 when there are duplicate names', async () => {
    const url = `/v1/courses/${courseId}/tasks`;
    const dbName = (await createData.createCourseTask(coursePartId)).name;

    const add = (name: string): NewCourseTaskData => ({
      ...getAddCourseTask(),
      name,
    });

    const edit = async (name: string): Promise<EditCourseTaskData> => ({
      ...(await getEditCourseTask()),
      name,
    });

    const invalid = [
      {add: [add('same'), add('same')]},
      {edit: [await edit('same'), await edit('same')]},
      {add: [add('same')], edit: [await edit('same')]},
      {add: [add(dbName)]},
      {edit: [await edit(dbName)]},
    ];

    for (const input of invalid) {
      await responseTests.testConflict(url, cookies.adminCookie).post(input);
    }
  });

  it('should respond with 409 when trying to modify the same task multiple times', async () => {
    const url = `/v1/courses/${courseId}/tasks`;

    const id = (await createData.createCourseTask(coursePartId)).id;
    const edit = {...(await getEditCourseTask()), id};

    const invalid = [
      {edit: [edit, edit]},
      {delete: [id, id]},
      {edit: [edit], delete: [id]},
    ];

    for (const input of invalid) {
      await responseTests.testConflict(url, cookies.adminCookie).post(input);
    }
  });

  it('should respond with 409 when a course part does not belong to the course', async () => {
    const url = `/v1/courses/${courseId}/tasks`;
    await responseTests.testConflict(url, cookies.adminCookie).post({
      add: [{...getAddCourseTask(), coursePartId: differentCoursePartId}],
    });
  });

  it('should respond with 409 when a course task does not belong to the course', async () => {
    const url = `/v1/courses/${courseId}/tasks`;

    const invalid = [
      {edit: [{...(await getEditCourseTask()), id: differentCourseTaskId}]},
      {delete: [differentCourseTaskId]},
    ];

    for (const input of invalid) {
      await responseTests.testConflict(url, cookies.adminCookie).post(input);
    }
  });
});
