// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { mockAttainable } from '../mockData/attainable';
import { app } from '../../src/app';
import { AttainableData } from '../../src/types/attainable';
import { HttpCode } from '../../src/types/httpCode';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';

function evaluateSubAttainment(attainment: AttainableData): void {
  if (attainment.subAttainments && attainment.subAttainments.length > 0) {
    for (const subAttainment of attainment.subAttainments) {
      evaluateSubAttainment(subAttainment);
    }
  }
  expect(attainment.id).toBeDefined();
  expect(attainment.courseId).toBeDefined();
  expect(attainment.courseInstanceId).toBeDefined();
  expect(attainment.name).toBeDefined();
  expect(attainment.date).toBeDefined();
  expect(attainment.expiryDate).toBeDefined();
  expect(attainment.parentId).toBeDefined();
  expect(attainment.tag).toBeDefined();
}

describe('Test POST /v1/courses/:courseId/instances/:instanceId/attainments', () => {

  it('should create a new attainable with no sub-attainables when course and course instance exist',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ ...mockAttainable, subAttainments: undefined })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.id).toBeDefined();
      expect(res.body.data.attainment.courseId).toBe(1);
      expect(res.body.data.attainment.courseInstanceId).toBe(1);
      expect(res.body.data.attainment.name).toBe(mockAttainable.name);
      expect(res.body.data.attainment.date).toBeDefined();
      expect(res.body.data.attainment.expiryDate).toBeDefined();
      expect(res.body.data.attainment.parentId).toBe(null);
      expect(res.body.data.attainment.tag).toBeDefined();
      expect(res.body.data.attainment.subAttainments).not.toBeDefined();
      expect(res.statusCode).toBe(HttpCode.Ok);
    });

  it('should create a new attainable with sub-attainables when course and course instance exist',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(mockAttainable)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.id).toBeDefined();
      expect(res.body.data.attainment.courseId).toBe(1);
      expect(res.body.data.attainment.courseInstanceId).toBe(1);
      expect(res.body.data.attainment.name).toBe(mockAttainable.name);
      expect(res.body.data.attainment.date).toBeDefined();
      expect(res.body.data.attainment.expiryDate).toBeDefined();
      expect(res.body.data.attainment.parentId).toBe(null);
      expect(res.body.data.attainment.tag).toBeDefined();
      expect(res.body.data.attainment.subAttainments).toBeDefined();

      for (const subAttainment of res.body.data.attainment.subAttainments) {
        evaluateSubAttainment(subAttainment);
      }

      expect(res.statusCode).toBe(HttpCode.Ok);
    });

  it('should create a new attainable with parent attainment', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/attainments')
      .send({ parentId: 1, ...mockAttainable })
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.attainment.parentId).toBe(1);

    for (const subAttainment of res.body.data.attainment.subAttainments) {
      evaluateSubAttainment(subAttainment);
    }

    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 404 not found, if course instance does not exist',
    async () => {
      const res: supertest.Response = await request
        .post(`/v1/courses/1/instances/${badId}/attainments`)
        .send(mockAttainable)
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
        .send(mockAttainable)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`course with ID ${badId} not found`);
      expect(res.statusCode).toBe(HttpCode.NotFound);
    });

  it('should respond with 422 unprocessable entity, if parent attainment does not exist',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ parentId: badId, ...mockAttainable })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
      expect(res.statusCode).toBe(HttpCode.UnprocessableEntity);
    });

  it('should respond with 400 bad request, if validation fails (non-number course instance id)',
    async () => {
      const res: supertest.Response = await request
        .post(`/v1/courses/1/instances/${badInput}/attainments`)
        .send(mockAttainable)
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
        .send(mockAttainable)
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
        .send({ parentId: badInput, ...mockAttainable })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (date not valid date)',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ ...mockAttainable, date: badInput,})
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
        .send({ ...mockAttainable, expiryDate: badInput,})
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails in the sub-attainment level',
    async () => {
      // Validate on level 1
      let res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ ...mockAttainable, subAttainments: [
          {
            name: 'Exercise 1',
            date: badInput,
            expiryDate: new Date(2024, 8, 14),
            subAttainments: [],
          }
        ]})
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);

      // Validate on level 2
      res = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ ...mockAttainable, subAttainments: [
          {
            name: 'Exercise 1',
            date: new Date(2024, 8, 14),
            expiryDate: new Date(2024, 8, 14),
            subAttainments: [
              {
                name: 'Exercise 1',
                date: new Date(2024, 8, 14),
                expiryDate: new Date(2024, 8, 14),
                subAttainments: badInput,
              }
            ],
          }
        ]})
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);

      // Validate on level 3
      res = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ ...mockAttainable, subAttainments: [
          {
            name: 'Exercise 1',
            date: new Date(2024, 8, 14),
            expiryDate: new Date(2024, 8, 14),
            subAttainments: [
              {
                name: 'Exercise 1',
                date: new Date(2024, 8, 14),
                expiryDate: new Date(2024, 8, 14),
                subAttainments: [
                  {
                    name: 'Exercise 1',
                    date: new Date(2024, 8, 14),
                    expiryDate: badInput,
                    subAttainments: [],
                  }
                ],
              }
            ],
          }
        ]})
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 409 conflict, if instance does not belong to the course',
    async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/2/attainments')
        .send(mockAttainable)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(
        'course instance with ID 2 does not belong to the course with ID 1'
      );
      expect(res.statusCode).toBe(HttpCode.Conflict);
    });

  it('should respond with 409 conflict, if parent attainment does not belong to the instance',
    async () => {

      // Create parent attainment for course instance 1.
      let res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(mockAttainable)
        .set('Content-Type', 'application/json');

      const id: number = Number(res.body.data.attainment.id);

      // Try to add new attainment with previously created parent to instance 2.
      res = await request
        .post('/v1/courses/2/instances/2/attainments')
        .send({ parentId: id, ...mockAttainable })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(
        `parent attainment ID ${id} does not belong to the course instance ID 2`);
      expect(res.statusCode).toBe(HttpCode.Conflict);
    });
});

describe('Test PUT /v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId', () => {
  let id: number;

  it('should update field succesfully on an existing attainable', async () => {
    // Create a new attainable.
    let res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/attainments')
      .send(mockAttainable)
      .set('Content-Type', 'application/json');

    id = res.body.data.attainment.id;

    res = await request
      .put(`/v1/courses/1/instances/1/attainments/${id}`)
      .send({
        name: 'new name',
        date: mockAttainable.date,
        expiryDate: mockAttainable.expiryDate
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
    expect(new Date(res.body.data.attainment.date).getTime())
      .toBe(mockAttainable.date.getTime());
    expect(new Date(res.body.data.attainment.expiryDate).getTime())
      .toBe(mockAttainable.expiryDate.getTime());
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 404 not found, if attainment does not exist', async () => {
    const res: supertest.Response = await request
      .put(`/v1/courses/1/instances/1/attainments/${badId}`)
      .send(mockAttainable)
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
        .send(mockAttainable)
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
        .send(mockAttainable)
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
        .send(mockAttainable)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });
});
