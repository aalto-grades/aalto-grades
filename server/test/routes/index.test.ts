// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from '../../src/app';
import supertest from 'supertest';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test GET /', () => {
  it('should respond "Hello /" with status code 200', async () => {
    const res: supertest.Response = await request.get('/');
    expect(res.text).toBe('Hello /');
    expect(res.statusCode).toBe(200);
  });
});

describe('Test GET /v1/courses/:courseId', () => {
  it('should respond with correct data when course exists', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1');
    expect(res.body.success).toBe(true);
    expect(res.body.course).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.course.id).toBe(1);
    expect(res.body.course.courseCode).toBeDefined();
    expect(res.body.course.minCredits).toBeDefined();
    expect(res.body.course.maxCredits).toBeDefined();
    expect(res.body.course.department).toBeDefined();
    expect(res.body.course.name).toBeDefined();
    expect(res.body.course.evaluationInformation).toBeDefined();
    expect(res.statusCode).toBe(200);
  });

  it('should respond with 404 not found, if non-existing course id', async () => {
    const res: supertest.Response = await request.get('/v1/courses/9999999999999');
    expect(res.body.success).toBe(false);
    expect(res.body.course).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);
  });
});

describe('Test GET /v1/courses/:courseId/instances/:instanceId', () => {
  it('should respond with correct data when course instance exists', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1/instances/1');
    expect(res.body.success).toBe(true);
    expect(res.body.instance).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.instance.id).toBe(1);
    expect(res.body.instance.courseCode).toBeDefined();
    expect(res.body.instance.minCredits).toBeDefined();
    expect(res.body.instance.maxCredits).toBeDefined();
    expect(res.body.instance.startingPeriod).toBeDefined();
    expect(res.body.instance.endingPeriod).toBeDefined();
    expect(res.body.instance.startDate).toBeDefined();
    expect(res.body.instance.endDate).toBeDefined();
    expect(res.body.instance.courseType).toBeDefined();
    expect(res.body.instance.gradingType).toBeDefined();
    expect(res.body.instance.responsibleTeacher).toBeDefined();
    expect(res.body.instance.department).toBeDefined();
    expect(res.body.instance.name).toBeDefined();
    expect(res.body.instance.evaluationInformation).toBeDefined();
    expect(res.statusCode).toBe(200);
  });

  it('should respond with 404 not found, if non-existing course instance id', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1/instances/99999999999');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);
  });

  it('should respond with 404 not found, if non-existing course id', async () => {
    const res: supertest.Response = await request.get('/v1/courses/9999999999/instances/1');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);
  });
});
