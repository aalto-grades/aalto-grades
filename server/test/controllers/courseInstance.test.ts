// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test POST /v1/courses/:courseId/instances', () => {
  it('should return success with correct input', async () => {
    async function goodInput(input: object): Promise<void> {
      const res: supertest.Response =
        await request
          .post('/v1/courses/1/instances')
          .send(input);

      expect(res.body.success).toBe(true);
      expect(res.body.instance).toBeDefined();
      expect(res.body.instance.id).toBeDefined();
      expect(res.statusCode).toBe(200);
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
      expect(res.statusCode).toBe(400);
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
        .post('/v1/courses/-1/instances')
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
    expect(res.statusCode).toBe(401);
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
          responsibleTeacher: -1,
          minCredits: 5,
          maxCredits: 5,
          startDate: '2022-7-10',
          endDate: '2022-11-10'
        });

    expect(res.body.success).toBe(false);
    expect(res.statusCode).toBe(401);
  });
});

describe('Test GET /v1/instances/:instanceId', () => {
  it('should respond with correct data when course instance exists', async () => {
    const res: supertest.Response = await request.get('/v1/instances/1');
    expect(res.body.success).toBe(true);
    expect(res.body.instance).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.instance.id).toBe(1);
    expect(res.body.instance.startingPeriod).toBeDefined();
    expect(res.body.instance.endingPeriod).toBeDefined();
    expect(res.body.instance.minCredits).toBeDefined();
    expect(res.body.instance.maxCredits).toBeDefined();
    expect(res.body.instance.startDate).toBeDefined();
    expect(res.body.instance.endDate).toBeDefined();
    expect(res.body.instance.courseType).toBeDefined();
    expect(res.body.instance.gradingType).toBeDefined();
    expect(res.body.instance.responsibleTeacher).toBeDefined();
    expect(res.body.instance.courseData.courseCode).toBeDefined();
    expect(res.body.instance.courseData.department).toBeDefined();
    expect(res.body.instance.courseData.name).toBeDefined();
    expect(res.body.instance.courseData.evaluationInformation).toBeDefined();
    expect(res.statusCode).toBe(200);
  });

  it('should respond with 404 not found, if non-existing course instance id', async () => {
    const res: supertest.Response = await request.get('/v1/instances/-1');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);
  });

  it('should respond with 400 bad request, if validation fails (non-number instance id)',
    async () => {
      const res: supertest.Response = await request.get('/v1/instances/abc');
      expect(res.body.success).toBe(false);
      expect(res.body.instance).not.toBeDefined();
      expect(res.body.error).toBeDefined();
      expect(res.statusCode).toBe(400);
    });
});
