// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';

import { Assignment } from '../../src/types/course';
import { HttpCode } from '../../src/types/httpCode';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';

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
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.assignment.id).toBeDefined();
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 404 not found, if course instance does not exist',
    async () => {
      const res: supertest.Response = await request.post('/v1/assignment')
        .send({
          courseInstanceId: badId,
          name: payload.name,
          executionDate: payload.executionDate,
          expiryDate: payload.expiryDate
        })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`course instance with ID ${badId} not found`);
      expect(res.statusCode).toBe(HttpCode.NotFound);
    });

  it('should respond with 400 bad request, if validation fails (non-number course instance id)',
    async () => {
      const res: supertest.Response = await request.post('/v1/assignment')
        .send({
          courseInstanceId: badInput,
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
      const res: supertest.Response = await request.post('/v1/assignment')
        .send({
          courseInstanceId: payload.courseInstanceId,
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
});

describe('Test PUT /v1/assignment/:assignmentId', () => {
  let id: number;

  it('should update field succesfully on an existing assignment', async () => {
    // Create a new assignment.
    let res: supertest.Response = await request.post('/v1/assignment')
      .send(payload)
      .set('Content-Type', 'application/json');

    id = res.body.data.assignment.id;

    res = await request.put(`/v1/assignment/${id}`)
      .send({
        name: 'new name'
      })
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.assignment.id).toBe(id);
    expect(res.body.data.assignment.courseInstanceId).toBe(payload.courseInstanceId);
    expect(res.body.data.assignment.name).toBe('new name');
    expect(new Date(res.body.data.assignment.executionDate).getTime())
      .toBe(payload.executionDate.getTime());
    expect(new Date(res.body.data.assignment.expiryDate).getTime())
      .toBe(payload.expiryDate.getTime());
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 404 not found, if assignment does not exist', async () => {
    const res: supertest.Response = await request.put(`/v1/assignment/${badId}`)
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors[0]).toBe(`assignment with ID ${badId} not found`);
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with 404 not found, if course instance does not exist', async () => {
    const res: supertest.Response = await request.put(`/v1/assignment/${id}`)
      .send({
        courseInstanceId: badId
      })
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors[0]).toBe(`course instance with ID ${badId} not found`);
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with 400 bad request, if validation fails (non-number assignment id)',
    async () => {
      const res: supertest.Response = await request.put(`/v1/assignment/${badInput}`)
        .send(payload)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (executionDate not valid date)',
    async () => {
      const res: supertest.Response = await request.put(`/v1/assignment/${id}`)
        .send({
          courseInstanceId: payload.courseInstanceId,
          name: payload.name,
          executionDate: badInput,
          expiryDate: payload.expiryDate
        })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (expiryDate not valid date)',
    async () => {
      const res: supertest.Response = await request.put(`/v1/assignment/${id}`)
        .send({
          courseInstanceId: payload.courseInstanceId,
          name: payload.name,
          executionDate: payload.executionDate,
          expiryDate: badInput
        })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });
});
