// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;

describe('Test GET /v1/courses/instances/:instanceId', () => {

  it('should respond with correct data when course instance exists', async () => {
    const res: supertest.Response = await request.get('/v1/instances/1');
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
    expect(res.body.data.courseInstance.courseType).toBeDefined();
    expect(res.body.data.courseInstance.gradingType).toBeDefined();
    expect(res.body.data.courseInstance.responsibleTeacher).toBeDefined();
    expect(res.body.data.courseInstance.courseData.courseCode).toBeDefined();
    expect(res.body.data.courseInstance.courseData.department).toBeDefined();
    expect(res.body.data.courseInstance.courseData.name).toBeDefined();
    expect(res.body.data.courseInstance.courseData.evaluationInformation).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 404 not found, if non-existing course instance id', async () => {
    const res: supertest.Response = await request.get(`/v1/courses/instances/${badId}`);
    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with 400 bad request, if validation fails (non-number instance id)',
    async () => {
      const res: supertest.Response = await request.get('/v1/courses/instances/abc');
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });
});

describe('Test GET /v1/courses/:courseId/instances', () => {

  it('should respond with correct data', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1/instances');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(HttpCode.Ok);
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
    expect(res.body.data.courseInstances[0].courseType).toBeDefined();
    expect(res.body.data.courseInstances[0].gradingType).toBeDefined();
    expect(res.body.data.courseInstances[0].responsibleTeacher).toBeDefined();
  });

  it('should respond with error if course does not exist', async () => {
    const res: supertest.Response = await request.get(`/v1/courses/${badId}/instances`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with error if courseId is not a number', async () => {
    const res: supertest.Response = await request.get('/v1/courses/a/instances');
    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.BadRequest);
  });
});

describe('Test POST /v1/courses/:courseId/instances', () => {

  it('should return success with correct input', async () => {
    async function goodInput(input: object): Promise<void> {
      const res: supertest.Response =
        await request
          .post('/v1/courses/1/instances')
          .send(input);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.instance.id).toBeDefined();
      expect(res.statusCode).toBe(HttpCode.Ok);
    }

    await goodInput({
      gradingType: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await goodInput({
      gradingType: 'PASSFAIL',
      startingPeriod: 'III',
      endingPeriod: 'V',
      teachingMethod: 'EXAM',
      responsibleTeacher: 2,
      minCredits: 3,
      maxCredits: 5,
      startDate: '2023-1-19',
      endDate: '2024-4-8'
    });

    await goodInput({
      gradingType: 'PASSFAIL',
      startingPeriod: 'III',
      endingPeriod: 'V',
      teachingMethod: 'EXAM',
      responsibleTeacher: 2,
      minCredits: 0,
      maxCredits: 1,
      startDate: '2023-1-19',
      endDate: '2024-4-8'
    });
  });

  it('should return fail with incorrect input', async () => {
    async function badInput(input: object): Promise<void> {
      const res: supertest.Response =
        await request
          .post('/v1/courses/1/instances')
          .send(input);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    }

    await badInput({
      foo: 'bar'
    });

    await badInput({
      gradingType: 'Wrong enum',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingType: 'PASSFAIL',
      startingPeriod: {
        junk: 'data'
      },
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingType: 'PASSFAIL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 42,
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingType: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: 'not a date',
      endDate: 'not a date either'
    });

    await badInput({
      gradingType: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 3,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingType: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: -1,
      maxCredits: 3,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

  });

  it('should return fail with nonexistent course ID', async () => {
    const res: supertest.Response =
      await request
        .post('/v1/courses/9999999/instances')
        .send({
          gradingType: 'NUMERICAL',
          startingPeriod: 'I',
          endingPeriod: 'II',
          teachingMethod: 'LECTURE',
          responsibleTeacher: 1,
          minCredits: 5,
          maxCredits: 5,
          startDate: '2022-7-10',
          endDate: '2022-11-10'
        });

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should return fail with nonexistent responsible teacher', async () => {
    const res: supertest.Response =
      await request
        .post('/v1/courses/1/instances')
        .send({
          gradingType: 'NUMERICAL',
          startingPeriod: 'I',
          endingPeriod: 'II',
          teachingMethod: 'LECTURE',
          responsibleTeacher: 9999999,
          minCredits: 5,
          maxCredits: 5,
          startDate: '2022-7-10',
          endDate: '2022-11-10'
        });

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });
});
