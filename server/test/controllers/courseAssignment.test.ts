// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';

import { Assignment } from '../../src/types/course';
import { HttpCode } from '../../src/types/httpCode';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

const payload: Assignment = {
  courseInstanceId: 1,
  name: 'exam assignment 1.1',
  executionDate: new Date('2022-02-02'),
  expiryDate: new Date('2022-01-01')
};

describe('Test POST /v1/assignment', () => {

  it('should create a new assignment when course instance exists', async () => {
    const res: supertest.Response = await request.post('/v1/assignment')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.data.assignment.id).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  // Todo: correct the status codes after error hander added
  it('should respond with 404 not found, if course instance does not exist',
    async () => {
      const res: supertest.Response = await request.post('/v1/assignment')
        .send({
          courseInstanceId: 999999,
          name: payload.name,
          executionDate: payload.executionDate,
          expiryDate: payload.expiryDate
        })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.NotFound);
    });

  it('should respond with 400 bad request, if validation fails (non-number course instance id)',
    async () => {
      const res: supertest.Response = await request.post('/v1/assignment')
        .send({
          courseInstanceId: 'abc',
          name: payload.name,
          executionDate: payload.executionDate,
          expiryDate: payload.expiryDate
        })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (executionDate not valid date)',
    async () => {
      const res: supertest.Response = await request.post('/v1/assignment')
        .send({
          courseInstanceId: payload.courseInstanceId,
          name: payload.name,
          executionDate: 'not valid',
          expiryDate: payload.expiryDate
        })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (expiryDate not valid date)',
    async () => {
      const res: supertest.Response = await request.post('/v1/assignment')
        .send({
          courseInstanceId: payload.courseInstanceId,
          name: payload.name,
          executionDate: payload.executionDate,
          expiryDate: 'not valid'
        })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });
});
