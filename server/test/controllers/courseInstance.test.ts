// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
let authCookie: Array<string> = [];

beforeAll(async () => {
  authCookie = await getCookies();
});

describe(
  'Test GET /v1/courses/:courseId/instances/:instanceId - get instance data with instance id',
  () => {

    it('should respond with correct data when course instance exists', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/instances/1')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courseInstance).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.courseInstance.id).toBe(1);
      expect(res.body.data.courseInstance.startingPeriod).toBeDefined();
      expect(res.body.data.courseInstance.endingPeriod).toBeDefined();
      expect(res.body.data.courseInstance.minCredits).toBeDefined();
      expect(res.body.data.courseInstance.maxCredits).toBeDefined();
      expect(res.body.data.courseInstance.startDate).toBeDefined();
      expect(res.body.data.courseInstance.endDate).toBeDefined();
      expect(res.body.data.courseInstance.type).toBeDefined();
      expect(res.body.data.courseInstance.gradingScale).toBeDefined();
      expect(res.body.data.courseInstance.teachersInCharge).toBeDefined();
      expect(res.body.data.courseInstance.courseData.courseCode).toBeDefined();
      expect(res.body.data.courseInstance.courseData.department).toBeDefined();
      expect(res.body.data.courseInstance.courseData.name).toBeDefined();
      expect(res.body.data.courseInstance.courseData.evaluationInformation).toBeDefined();
    });

    it('should not count students as teachers in charge', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/5/instances/14')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courseInstance.teachersInCharge.length).toBe(1);
    });

    it('should not count teachers as teachers in charge', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/6/instances/15')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courseInstance.teachersInCharge.length).toBe(1);
    });

    it('should find multiple teachers in charge', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/4/instances/5')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courseInstance.teachersInCharge.length).toBe(2);
    });

    it('should respond with 400 bad request, if validation fails (non-number instance id)',
      async () => {
        const res: supertest.Response = await request
          .get('/v1/courses/1/instances/abc')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/instances/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);

      expect(res.body.success).toBe(false);
      expect(res.body.errors[0]).toBe('unauthorized');
      expect(res.body.data).not.toBeDefined();
    });

    it('should respond with 404 not found, with nonexistent course instance ID', async () => {
      const res: supertest.Response = await request
        .get(`/v1/courses/1/instances/${badId}`)
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 409 conflict, when the instance ID does not match the course ID',
      async () => {
        const res: supertest.Response = await request
          .get('/v1/courses/2/instances/1')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
      });

  });

describe(
  'Test GET /v1/courses/:courseId/instances - get all instances belonging to course',
  () => {

    it('should respond with correct data', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/instances')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courseInstances[0].courseData.id).toBeDefined();
      expect(res.body.data.courseInstances[0].courseData.courseCode).toBeDefined();
      expect(res.body.data.courseInstances[0].id).toBeDefined();
      expect(res.body.data.courseInstances[0].sisuCourseInstanceId).toBeDefined();
      expect(res.body.data.courseInstances[0].startingPeriod).toBeDefined();
      expect(res.body.data.courseInstances[0].endingPeriod).toBeDefined();
      expect(res.body.data.courseInstances[0].minCredits).toBeDefined();
      expect(res.body.data.courseInstances[0].maxCredits).toBeDefined();
      expect(res.body.data.courseInstances[0].startDate).toBeDefined();
      expect(res.body.data.courseInstances[0].endDate).toBeDefined();
      expect(res.body.data.courseInstances[0].type).toBeDefined();
      expect(res.body.data.courseInstances[0].gradingScale).toBeDefined();
      expect(res.body.data.courseInstances[0].teachersInCharge).toBeDefined();
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/instances')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);

      expect(res.body.success).toBe(false);
      expect(res.body.errors[0]).toBe('unauthorized');
      expect(res.body.data).not.toBeDefined();
    });

    it('should respond with 400 bad request, if courseId is not a number', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/a/instances')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      const res: supertest.Response = await request
        .get(`/v1/courses/${badId}/instances`)
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

  });

describe('Test POST /v1/courses/:courseId/instances - create new course instance', () => {

  it('should return success with correct input', async () => {
    async function goodInput(input: object): Promise<void> {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances')
        .send(input)
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.courseInstance.id).toBeDefined();
    }

    await goodInput({
      gradingScale: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      teachersInCharge: [1],
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await goodInput({
      gradingScale: 'PASS_FAIL',
      startingPeriod: 'III',
      endingPeriod: 'V',
      type: 'EXAM',
      teachersInCharge: [2],
      minCredits: 3,
      maxCredits: 5,
      startDate: '2023-1-19',
      endDate: '2024-4-8'
    });

    await goodInput({
      gradingScale: 'PASS_FAIL',
      startingPeriod: 'III',
      endingPeriod: 'V',
      type: 'EXAM',
      teachersInCharge: [2, 1],
      minCredits: 0,
      maxCredits: 1,
      startDate: '2023-1-19',
      endDate: '2024-4-8'
    });
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/1/instances')
      .send({})
      .set('Cookie', authCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(res.body.success).toBe(false);
    expect(res.body.errors[0]).toBe('unauthorized');
    expect(res.body.data).not.toBeDefined();
  });

  it('should respond with 400 bad request, if incorrect input', async () => {
    async function badInput(input: object): Promise<void> {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances')
        .send(input)
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    }

    await badInput({
      foo: 'bar'
    });

    await badInput({
      gradingScale: 'Wrong enum',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      teachersInCharge: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingScale: 'PASS_FAIL',
      startingPeriod: {
        junk: 'data'
      },
      endingPeriod: 'II',
      type: 'LECTURE',
      teachersInCharge: [1],
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingScale: 'PASS_FAIL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 42,
      teachersInCharge: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingScale: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      teachersInCharge: [1],
      minCredits: 5,
      maxCredits: 5,
      startDate: 'not a date',
      endDate: 'not a date either'
    });

    await badInput({
      gradingScale: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      teachersInCharge: [1],
      minCredits: 5,
      maxCredits: 3,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingScale: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      teachersInCharge: [1],
      minCredits: -1,
      maxCredits: 3,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

  });

  it('should respond with 404 not found, if nonexistent course ID', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/9999999/instances')
      .send({
        gradingScale: 'NUMERICAL',
        startingPeriod: 'I',
        endingPeriod: 'II',
        type: 'LECTURE',
        teachersInCharge: [1],
        minCredits: 5,
        maxCredits: 5,
        startDate: '2022-7-10',
        endDate: '2022-11-10'
      })
      .set('Cookie', authCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

  it('should respond with 422 unprocessable entity, if nonexistent teacher in charge', async () => {
    const res: supertest.Response =
      await request
        .post('/v1/courses/1/instances')
        .send({
          gradingScale: 'NUMERICAL',
          startingPeriod: 'I',
          endingPeriod: 'II',
          type: 'LECTURE',
          teachersInCharge: [9999999],
          minCredits: 5,
          maxCredits: 5,
          startDate: '2022-7-10',
          endDate: '2022-11-10'
        })
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.UnprocessableEntity);

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

});
