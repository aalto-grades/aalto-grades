// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from 'aalto-grades-common/types';
import supertest from 'supertest';

import TeacherInCharge from '../../src/database/models/teacherInCharge';

import {mockTeacher} from '../mock-data/misc';
import {app} from '../../src/app';
import {Cookies, getCookies} from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const dateOnlyRegExp: RegExp =
  /^\d{4}[/-](0?[1-9]|1[012])[/-](0?[1-9]|[12][0-9]|3[01])$/;
let cookies: Cookies = {
  adminCookie: [],
  userCookie: [],
};

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test GET /v1/courses/:courseId/instances/:instanceId - get instance data with instance id', () => {
  it('should respond with correct data when course instance exists', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1/instances/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.data).toBeDefined();
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.assessmentModelId).toBe(1);
    expect(res.body.data.startingPeriod).toBeDefined();
    expect(res.body.data.endingPeriod).toBeDefined();
    expect(res.body.data.startDate).toBeDefined();
    expect(res.body.data.endDate).toBeDefined();
    expect(res.body.data.type).toBeDefined();
    expect(res.body.data.courseData.courseCode).toBeDefined();
    expect(res.body.data.courseData.minCredits).toBeDefined();
    expect(res.body.data.courseData.maxCredits).toBeDefined();
    expect(res.body.data.courseData.gradingScale).toBeDefined();
    expect(res.body.data.courseData.teachersInCharge).toBeDefined();
    expect(res.body.data.courseData.languageOfInstruction).toBeDefined();
    expect(res.body.data.courseData.teachersInCharge[0].name).toBeDefined();
    expect(res.body.data.courseData.department).toBeDefined();
    expect(res.body.data.courseData.name).toBeDefined();
  });

  it('should return dates in the correct format', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1/instances/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.data.startDate).toMatch(dateOnlyRegExp);
    expect(res.body.data.endDate).toMatch(dateOnlyRegExp);
  });

  it('should respond with 400 bad request, if validation fails (non-number instance id)', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1/instances/abc')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/courses/1/instances/1')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 404 not found, with nonexistent course instance ID', async () => {
    const res: supertest.Response = await request
      .get(`/v1/courses/1/instances/${badId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

  it('should respond with 409 conflict, when the instance ID does not match the course ID', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/2/instances/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Conflict);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });
});

describe('Test GET /v1/courses/:courseId/instances - get all instances belonging to course', () => {
  it('should respond with correct data', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1/instances')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.data[0].assessmentModelId).toBeDefined();
    expect(res.body.data[0].courseData.id).toBeDefined();
    expect(res.body.data[0].courseData.courseCode).toBeDefined();
    expect(res.body.data[0].courseData.teachersInCharge).toBeDefined();
    expect(res.body.data[0].id).toBeDefined();
    expect(res.body.data[0].sisuCourseInstanceId).toBeDefined();
    expect(res.body.data[0].startingPeriod).toBeDefined();
    expect(res.body.data[0].endingPeriod).toBeDefined();
    expect(res.body.data[0].startDate).toBeDefined();
    expect(res.body.data[0].endDate).toBeDefined();
    expect(res.body.data[0].type).toBeDefined();
  });

  it('should return dates in the correct format', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1/instances')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    for (const courseInstance of res.body.data) {
      expect(courseInstance.startDate).toMatch(dateOnlyRegExp);
      expect(courseInstance.endDate).toMatch(dateOnlyRegExp);
    }
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/courses/1/instances')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 400 bad request, if courseId is not a number', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/a/instances')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res: supertest.Response = await request
      .get(`/v1/courses/${badId}/instances`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });
});

describe('Test POST /v1/courses/:courseId/instances - create new course instance', () => {
  it('should create new instance with correct input (admin user)', async () => {
    async function goodInput(input: object): Promise<void> {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances')
        .send(input)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
    }

    await goodInput({
      sisuCourseInstanceId: 'aalto-CUR-165388-3874872',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      startDate: '2022-7-10',
      endDate: '2022-11-10',
    });

    await goodInput({
      startingPeriod: 'III',
      endingPeriod: 'V',
      type: 'EXAM',
      startDate: '2023-1-19',
      endDate: '2024-4-8',
    });

    await goodInput({
      assessmentModelId: 1,
      startingPeriod: 'III',
      endingPeriod: 'V',
      type: 'EXAM',
      startDate: '2023-1-19',
      endDate: '2024-4-8',
    });
  });

  it('should create new instance with correct input (teacher in charge)', async () => {
    jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

    const res: supertest.Response = await request
      .post('/v1/courses/1/instances')
      .send({
        startingPeriod: 'I',
        endingPeriod: 'II',
        type: 'LECTURE',
        startDate: '2022-7-10',
        endDate: '2022-11-10',
      })
      .set('Cookie', cookies.userCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
  });

  it('should respond with 400 bad request, if incorrect input', async () => {
    async function badInput(input: object): Promise<void> {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances')
        .send(input)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    }

    await badInput({
      foo: 'bar',
    });

    await badInput({
      startingPeriod: {
        junk: 'data',
      },
      endingPeriod: 'II',
      type: 'LECTURE',
      startDate: '2022-7-10',
      endDate: '2022-11-10',
    });

    await badInput({
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      startDate: 'not a date',
      endDate: 'not a date either',
    });
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .post('/v1/courses/1/instances')
      .send({})
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/1/instances')
      .send({
        startingPeriod: 'I',
        endingPeriod: 'II',
        type: 'LECTURE',
        startDate: '2022-7-10',
        endDate: '2022-11-10',
      })
      .set('Cookie', cookies.userCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

  it('should respond with 404 not found, if nonexistent course ID', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/9999999/instances')
      .send({
        startingPeriod: 'I',
        endingPeriod: 'II',
        type: 'LECTURE',
        teachersInCharge: [1],
        startDate: '2022-7-10',
        endDate: '2022-11-10',
      })
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

  it('should respond with 409 conflict, if sisu instance ID is already in use', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/1/instances')
      .send({
        sisuCourseInstanceId: 'aalto-CUR-165388-3874205',
        startingPeriod: 'I',
        endingPeriod: 'II',
        type: 'LECTURE',
        startDate: '2022-7-10',
        endDate: '2022-11-10',
      })
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Conflict);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors[0]).toBe(
      'sisu ID aalto-CUR-165388-3874205 already in use on instance ID 1'
    );
  });
});
