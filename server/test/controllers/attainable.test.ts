// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import Attainable from '../../src/database/models/attainable';

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
      expect(res.body.data.attainment.parentId).toBe(null);
      expect(res.body.data.attainment.tag).toBeDefined();
      expect(res.body.data.attainment.subAttainments).toBeDefined();
      expect(new Date(res.body.data.attainment.date).getTime())
        .toBe(mockAttainable.date.getTime());
      expect(new Date(res.body.data.attainment.expiryDate).getTime())
        .toBe(mockAttainable.expiryDate.getTime());
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
      expect(res.body.data.attainment.parentId).toBe(null);
      expect(res.body.data.attainment.tag).toBeDefined();
      expect(res.body.data.attainment.subAttainments).toBeDefined();
      expect(new Date(res.body.data.attainment.date).getTime())
        .toBe(mockAttainable.date.getTime());
      expect(new Date(res.body.data.attainment.expiryDate).getTime())
        .toBe(mockAttainable.expiryDate.getTime());

      for (const subAttainment of res.body.data.attainment.subAttainments) {
        evaluateSubAttainment(subAttainment);
      }

      expect(res.statusCode).toBe(HttpCode.Ok);
    });

  it('should create a new attainable with parent attainable', async () => {
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

  it('should respond with 422 unprocessable entity, if parent attainable does not exist',
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

  it('should respond with 400 bad request, if validation fails (non-number parent attainable id)',
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

  it('should respond with 400 bad request, if validation fails in the sub-attainable level',
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

  it('should respond with 409 conflict, if parent attainable does not belong to the instance',
    async () => {

      // Create parent attainable for course instance 1.
      let res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(mockAttainable)
        .set('Content-Type', 'application/json');

      const id: number = Number(res.body.data.attainment.id);

      // Try to add new attainable with previously created parent to instance 2.
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

describe('Test DELETE /v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId', () => {
  it('should succesfully delete single attainment', async () => {
    const add: supertest.Response = await request
      .post('/v1/courses/1/instances/1/attainments')
      .send({
        ...mockAttainable,
        subAttainments: undefined
      });

    const addedAttainment: number = add.body.data.attainment.id;

    const res: supertest.Response = await request
      .delete(`/v1/courses/1/instances/1/attainments/${addedAttainment}`);

    expect(res.statusCode).toBe(HttpCode.Ok);
    expect(res.body.success).toBe(true);

    expect(await Attainable.findByPk(addedAttainment)).toBeNull;
  });

  it('should respond with 404 not found for non-existent attainment ID', async () => {
    const res: supertest.Response = await request
      .delete(`/v1/courses/1/instances/1/attainments/${badId}`);

    expect(res.statusCode).toBe(HttpCode.NotFound);
    expect(res.body.success).toBe(false);
  });
});

describe('Test PUT /v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId', () => {
  let subAttainable: AttainableData;
  let parentAttainable: AttainableData;

  it('should update field succesfully on an existing attainable', async () => {
    // Create a new attainables.
    let res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/attainments')
      .send(mockAttainable)
      .set('Content-Type', 'application/json');

    subAttainable = res.body.data.attainment;

    res = await request
      .put(`/v1/courses/1/instances/1/attainments/${subAttainable.id}`)
      .send({
        name: 'new name',
        date: mockAttainable.date,
        expiryDate: mockAttainable.expiryDate
      })
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.attainment.id).toBe(subAttainable.id);
    expect(res.body.data.attainment.courseId).toBe(1);
    expect(res.body.data.attainment.courseInstanceId).toBe(1);
    expect(res.body.data.attainment.parentId).toBe(null);
    expect(res.body.data.attainment.name).toBe('new name');
    expect(new Date(res.body.data.attainment.date).getTime())
      .toBe(mockAttainable.date.getTime());
    expect(new Date(res.body.data.attainment.expiryDate).getTime())
      .toBe(mockAttainable.expiryDate.getTime());
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should add parent succesfully on an existing attainable', async () => {
    // Create a new parent attainable.
    let res: supertest.Response = await request
      .post('/v1/courses/1/instances/1/attainments')
      .send(mockAttainable)
      .set('Content-Type', 'application/json');

    parentAttainable = res.body.data.attainment;

    res = await request
      .put(`/v1/courses/1/instances/1/attainments/${subAttainable.id}`)
      .send({ parentId: parentAttainable.id })
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(true);
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.attainment.id).toBe(subAttainable.id);
    expect(res.body.data.attainment.courseId).toBe(1);
    expect(res.body.data.attainment.courseInstanceId).toBe(1);
    expect(res.body.data.attainment.parentId).toBe(parentAttainable.id);
    expect(res.body.data.attainment.name).toBe('new name');
    expect(new Date(res.body.data.attainment.date).getTime())
      .toBe(mockAttainable.date.getTime());
    expect(new Date(res.body.data.attainment.expiryDate).getTime())
      .toBe(mockAttainable.expiryDate.getTime());
    expect(res.statusCode).toBe(HttpCode.Ok);
  });

  it('should respond with 409 conflict, if parent attainable belongs to different course instance',
    async () => {
    // Create a new parent attainable on a different instance.
      let res: supertest.Response = await request
        .post('/v1/courses/2/instances/2/attainments')
        .send(mockAttainable)
        .set('Content-Type', 'application/json');

      parentAttainable = res.body.data.attainment;

      res = await request
        .put(`/v1/courses/1/instances/1/attainments/${subAttainable.id}`)
        .send({ parentId: parentAttainable.id })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(
        `parent attainment ID ${parentAttainable.id} does not belong ` +
        `to the same instance as attainment ID ${subAttainable.id}`
      );
      expect(res.statusCode).toBe(HttpCode.Conflict);
    });

  it('should respond with 409 conflict, if attainable tries to refer itself in the parent id',
    async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/1/instances/1/attainments/${subAttainable.id}`)
        .send({ ...subAttainable, parentId: subAttainable.id })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe('attainment cannot refer to itself in the parent ID');
      expect(res.statusCode).toBe(HttpCode.Conflict);
    });

  it('should respond with 404 not found, if attainable does not exist', async () => {
    const res: supertest.Response = await request
      .put(`/v1/courses/1/instances/1/attainments/${badId}`)
      .send(mockAttainable)
      .set('Content-Type', 'application/json');

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
    expect(res.statusCode).toBe(HttpCode.NotFound);
  });

  it('should respond with 422 unprocessable entity, if parent attainable does not exist',
    async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/1/instances/1/attainments/${subAttainable.id}`)
        .send({ parentId: badId })
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
      expect(res.statusCode).toBe(HttpCode.UnprocessableEntity);
    });

  it('should respond with 400 bad request, if validation fails (non-number course instance id)',
    async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/1/instances/${badInput}/attainments/${subAttainable.id}`)
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
        .put(`/v1/courses/${badInput}/instances/1/attainments/${subAttainable.id}`)
        .send(mockAttainable)
        .set('Content-Type', 'application/json');

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      expect(res.statusCode).toBe(HttpCode.BadRequest);
    });

  it('should respond with 400 bad request, if validation fails (non-number attainable id)',
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
