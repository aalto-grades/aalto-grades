// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';
import { AttainableData } from '../../src/types/course';
import { HttpCode } from '../../src/types/httpCode';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';

const payload: AttainableData = {
  name: 'exam assignment 1.1',
  executionDate: new Date('2022-02-02'),
  expiryDate: new Date('2022-01-01'),
  subAssignments: []
};

describe('Test POST /v1/courses/:courseId/instances/:instanceId/attainments', () => {

  it('should create a new assignment when course and course instance exists', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/attainments')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.attainment.id).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should create a new assignment with parent attainment', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/attainments')
      .send({ parentId: 1, ...payload })
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.attainment.id).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 404 not found, if course instance does not exist',
    async () => {
      const res: supertest.Response = await request
        .post(`/v1/courses/1/instances/${badId}/attainments`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`course instance with ID ${badId} not found`);
      expect(res.statusCode).toBe(HttpCode.NotFound);
    });

  it('should respond with 404 not found, if course does not exist',
    async () => {
      const res: supertest.Response = await request
        .post(`/v1/courses/${badId}/instances/1/attainments`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`course with ID ${badId} not found`);
      expect(res.statusCode).toBe(HttpCode.NotFound);
    });

  it('should respond with 404 not found, if parent attainment does not exist',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ parentId: badId, ...payload })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
      expect(res.statusCode).toBe(HttpCode.NotFound);
    });

  it('should respond with 400 bad request, if validation fails (non-number course instance id)',
    async () => {
      const res: supertest.Response = await request
        .post(`/v1/courses/1/instances/${badInput}/attainments`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (non-number course id)',
    async () => {
      const res: supertest.Response = await request
        .post(`/v1/courses/${badInput}/instances/1/attainments`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (non-number parent attainment id)',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ parentId: badInput, ...payload })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (executionDate not valid date)',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({
          name: payload.name,
          executionDate: badInput,
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
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({
          name: payload.name,
          executionDate: payload.executionDate,
          expiryDate: badInput
        })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 409 conflict, if instance does not belong to the course',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/2/attainments')
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe('instance ID 2 does not belong to the course ID 1');
      expect(res.statusCode).toBe(HttpCode.Conflict);
    });

  it('should respond with 409 conflict, if parent attainment does not belong to the instance',
    async () => {

      // Create parent attainment for course instance 1.
      let res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(payload)
        .set('Content-Type', 'application/json');

      const id: number = Number(res.body.data.attainment.id);

      // Try to add new attainment with previously created parent to instance 2.
      res = await request
        .post('/v1/courses/2/instances/2/attainments')
        .send({ parentId: id, ...payload })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(
        `parent attainment ID ${id} does not belong to the instance ID 2`);
      expect(res.statusCode).toBe(HttpCode.Conflict);
    });
});

describe('Test PUT /v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId', () => {
  let id: number;

  it('should update field succesfully on an existing attainment', async () => {
    // Create a new assignment.
    let res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/attainments')
      .send(payload)
      .set('Content-Type', 'application/json');

    id = res.body.data.attainment.id;

    res = await request
      .put(`/v1/courses/1/instances/1/attainments/${id}`)
      .send({
        name: 'new name',
        executionDate: payload.executionDate,
        expiryDate: payload.expiryDate
      })
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.attainment.id).toBe(id);
    expect(res.body.data.attainment.courseId).toBe(1);
    expect(res.body.data.attainment.courseInstanceId).toBe(1);
    expect(res.body.data.attainment.attainableId).toBe(null);
    expect(res.body.data.attainment.createdAt).toBeDefined();
    expect(res.body.data.attainment.updatedAt).toBeDefined();
    expect(res.body.data.attainment.name).toBe('new name');
    expect(new Date(res.body.data.attainment.executionDate).getTime())
      .toBe(payload.executionDate.getTime());
    expect(new Date(res.body.data.attainment.expiryDate).getTime())
      .toBe(payload.expiryDate.getTime());
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 404 not found, if attainment does not exist', async () => {
    const res: supertest.Response = await request
      .put(`/v1/courses/1/instances/1/attainments/${badId}`)
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with 400 bad request, if validation fails (non-number course instance id)',
    async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/1/instances/${badInput}/attainments/${id}`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (non-number course id)',
    async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/${badInput}/instances/1/attainments/${id}`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (non-number attainment id)',
    async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/1/instances/1/attainments/${badInput}`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });
});
