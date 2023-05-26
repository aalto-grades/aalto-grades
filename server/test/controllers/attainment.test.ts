// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import Attainment from '../../src/database/models/attainment';

import { mockAttainment } from '../mockData/attainment';
import { app } from '../../src/app';
import { AttainmentData } from '../../src/types/attainment';
import { HttpCode } from '../../src/types/httpCode';
import { getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';
let authCookie: Array<string> = [];

beforeAll(async () => {
  authCookie = await getCookies();
});

interface AttainmentNode {
  id: number,
  subAttainments: Array<AttainmentNode>
}

function evaluateSubAttainment(attainment: AttainmentData): void {
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

describe(
  'Test POST /v1/courses/:courseId/instances/:instanceId/attainments - create attainment(s)',
  () => {

    it('should create a new attainment with no sub-attainments when course and instance exist',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ ...mockAttainment, subAttainments: undefined })
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.attainment.id).toBeDefined();
        expect(res.body.data.attainment.courseId).toBe(1);
        expect(res.body.data.attainment.courseInstanceId).toBe(1);
        expect(res.body.data.attainment.name).toBe(mockAttainment.name);
        expect(res.body.data.attainment.parentId).toBe(null);
        expect(res.body.data.attainment.tag).toBeDefined();
        expect(res.body.data.attainment.subAttainments).toBeDefined();
        expect(new Date(res.body.data.attainment.date).getTime())
          .toBe(mockAttainment.date.getTime());
        expect(new Date(res.body.data.attainment.expiryDate).getTime())
          .toBe(mockAttainment.expiryDate.getTime());
      });

    it('should create a new attainment with sub-attainments when course and course instance exist',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.attainment.id).toBeDefined();
        expect(res.body.data.attainment.courseId).toBe(1);
        expect(res.body.data.attainment.courseInstanceId).toBe(1);
        expect(res.body.data.attainment.name).toBe(mockAttainment.name);
        expect(res.body.data.attainment.parentId).toBe(null);
        expect(res.body.data.attainment.tag).toBeDefined();
        expect(res.body.data.attainment.subAttainments).toBeDefined();
        expect(new Date(res.body.data.attainment.date).getTime())
          .toBe(mockAttainment.date.getTime());
        expect(new Date(res.body.data.attainment.expiryDate).getTime())
          .toBe(mockAttainment.expiryDate.getTime());

        for (const subAttainment of res.body.data.attainment.subAttainments) {
          evaluateSubAttainment(subAttainment);
        }
      });

    it('should create a new attainment with parent attainment', async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send({ parentId: 1, ...mockAttainment })
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.parentId).toBe(1);

      for (const subAttainment of res.body.data.attainment.subAttainments) {
        evaluateSubAttainment(subAttainment);
      }
    });

    it('should respond with 400 bad request, if validation fails (non-number course instance id)',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/1/instances/${badInput}/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number course id)',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/${badInput}/instances/1/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number parent attainment id)',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ parentId: badInput, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (date not valid date)',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ ...mockAttainment, date: badInput,})
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (expiryDate not valid date)',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ ...mockAttainment, expiryDate: badInput,})
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails in the sub-attainment level',
      async () => {
      // Validate on level 1
        let res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ ...mockAttainment, subAttainments: [
            {
              name: 'Exercise 1',
              date: badInput,
              expiryDate: new Date(2024, 8, 14),
              subAttainments: [],
            }
          ]})
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);

        // Validate on level 2
        res = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ ...mockAttainment, subAttainments: [
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
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);

        // Validate on level 3
        res = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ ...mockAttainment, subAttainments: [
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
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .expect(HttpCode.Unauthorized);

      expect(res.body.success).toBe(false);
      expect(res.body.errors[0]).toBe('unauthorized');
      expect(res.body.data).not.toBeDefined();
    });

    it('should respond with 404 not found, if course instance does not exist',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/1/instances/${badId}/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.NotFound);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`course instance with ID ${badId} not found`);
      });

    it('should respond with 404 not found, if course does not exist',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/${badId}/instances/1/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.NotFound);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`course with ID ${badId} not found`);
      });

    it('should respond with 409 conflict, if instance does not belong to the course',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/instances/2/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(
          'course instance with ID 2 does not belong to the course with ID 1'
        );
      });

    it('should respond with 409 conflict, if parent attainment does not belong to the instance',
      async () => {
        // Create parent attainment for course instance 1.
        let res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json');

        const id: number = Number(res.body.data.attainment.id);

        // Try to add new attainment with previously created parent to instance 2.
        res = await request
          .post('/v1/courses/2/instances/2/attainments')
          .send({ parentId: id, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(
          `parent attainment ID ${id} does not belong to the course instance ID 2`
        );
      });

    it('should respond with 422 unprocessable entity, if parent attainment does not exist',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ parentId: badId, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.UnprocessableEntity);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
      });

  });

describe(
  'Test DELETE /v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId',
  () => {
    async function testAttainmentTreeDeletion(tree: object): Promise<void> {
      // Add an attainment tree.
      const add: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments').send(tree)
        .set('Cookie', authCookie);

      // Adds the IDs of all subattainemnts of the given tree to the given
      // attainments array.
      function findSubattainmentIds(tree: AttainmentNode, attainments: Array<number>): void {
        for (const leaf of tree.subAttainments) {
          attainments.push(leaf.id);
          findSubattainmentIds(leaf, attainments);
        }
      }

      // Find the IDs of all the added attainments.
      const rootAttainment: number = add.body.data.attainment.id;
      const addedAttainments: Array<number> = [rootAttainment];
      findSubattainmentIds(add.body.data.attainment, addedAttainments);

      // Verify that the attainments were added.
      for (const addedAttainment of addedAttainments)
        expect(await Attainment.findByPk(addedAttainment)).not.toBeNull;

      // Delete the root attainment.
      const res: supertest.Response = await request
        .delete(`/v1/courses/1/instances/1/attainments/${rootAttainment}`)
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      // Verify that the root attainment as well as all of its subattainments
      // were deleted.
      expect(res.body.success).toBe(true);
      for (const addedAttainment of addedAttainments)
        expect(await Attainment.findByPk(addedAttainment)).toBeNull;
    }

    it('should succesfully delete single attainment', async () => {
      // Add an attainment.
      const add: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(
          {
            name: 'Test exercise',
            date: new Date(),
            expiryDate: new Date(),
            subAttainments: []
          }
        )
        .set('Cookie', authCookie)
        .set('Accept', 'application/json');

      // Verify that the attainment was added.
      const addedAttainment: number = add.body.data.attainment.id;
      expect(await Attainment.findByPk(addedAttainment)).not.toBeNull;

      // Delete the added attainment.
      const res: supertest.Response = await request
        .delete(`/v1/courses/1/instances/1/attainments/${addedAttainment}`)
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      // Verify that the attainment was deleted.
      expect(res.body.success).toBe(true);
      expect(await Attainment.findByPk(addedAttainment)).toBeNull;
    });

    it('should succesfully delete a tree of attainments with depth 1', async () => {
      await testAttainmentTreeDeletion(
        {
          name: 'Test exercise',
          date: new Date(),
          expiryDate: new Date(),
          subAttainments: [
            {
              name: 'Test exercise 1.1',
              date: new Date(),
              expiryDate: new Date(),
              subAttainments: []
            },
            {
              name: 'Test exercise 1.2',
              date: new Date(),
              expiryDate: new Date(),
              subAttainments: []
            }
          ]
        }
      );
    });

    it('should succesfully delete a tree of attainments with depth greater than 1', async () => {
      await testAttainmentTreeDeletion(mockAttainment);
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      const res: supertest.Response = await request
        .delete('/v1/courses/1/instances/1/attainments/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);

      expect(res.body.success).toBe(false);
      expect(res.body.errors[0]).toBe('unauthorized');
      expect(res.body.data).not.toBeDefined();
    });

    it('should respond with 404 not found for non-existent attainment ID', async () => {
      const res: supertest.Response = await request
        .delete(`/v1/courses/1/instances/1/attainments/${badId}`)
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      expect(res.body.success).toBe(false);
    });

  });

describe(
  'Test PUT /v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId'
  + '- update attainment information',
  () => {
    let subAttainment: AttainmentData;
    let parentAttainment: AttainmentData;

    it('should update field succesfully on an existing attainment', async () => {
    // Create a new attainments.
      let res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      subAttainment = res.body.data.attainment;

      res = await request
        .put(`/v1/courses/1/instances/1/attainments/${subAttainment.id}`)
        .send({
          name: 'new name',
          date: mockAttainment.date,
          expiryDate: mockAttainment.expiryDate
        })
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.id).toBe(subAttainment.id);
      expect(res.body.data.attainment.courseId).toBe(1);
      expect(res.body.data.attainment.courseInstanceId).toBe(1);
      expect(res.body.data.attainment.parentId).toBe(null);
      expect(res.body.data.attainment.name).toBe('new name');
      expect(new Date(res.body.data.attainment.date).getTime())
        .toBe(mockAttainment.date.getTime());
      expect(new Date(res.body.data.attainment.expiryDate).getTime())
        .toBe(mockAttainment.expiryDate.getTime());
    });

    it('should add parent succesfully on an existing attainment', async () => {
    // Create a new parent attainment.
      let res: supertest.Response = await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie);

      parentAttainment = res.body.data.attainment;

      res = await request
        .put(`/v1/courses/1/instances/1/attainments/${subAttainment.id}`)
        .send({ parentId: parentAttainment.id })
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.id).toBe(subAttainment.id);
      expect(res.body.data.attainment.courseId).toBe(1);
      expect(res.body.data.attainment.courseInstanceId).toBe(1);
      expect(res.body.data.attainment.parentId).toBe(parentAttainment.id);
      expect(res.body.data.attainment.name).toBe('new name');
      expect(new Date(res.body.data.attainment.date).getTime())
        .toBe(mockAttainment.date.getTime());
      expect(new Date(res.body.data.attainment.expiryDate).getTime())
        .toBe(mockAttainment.expiryDate.getTime());
    });

    it('should respond with 400 bad request, if validation fails (non-number course instance id)',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/1/instances/${badInput}/attainments/${subAttainment.id}`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number course id)',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/${badInput}/instances/1/attainments/${subAttainment.id}`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number attainment id)',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/1/instances/1/attainments/${badInput}`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      const res: supertest.Response = await request
        .put('/v1/courses/1/instances/1/attainments/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);

      expect(res.body.success).toBe(false);
      expect(res.body.errors[0]).toBe('unauthorized');
      expect(res.body.data).not.toBeDefined();
    });

    it('should respond with 404 not found, if attainment does not exist', async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/1/instances/1/attainments/${badId}`)
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .set('Cookie', authCookie)
        .expect(HttpCode.NotFound);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
    });

    it(
      'should respond with 409 conflict, if parent attainment belongs to different course instance',
      async () => {
        // Create a new parent attainment on a different instance.
        let res: supertest.Response = await request
          .post('/v1/courses/2/instances/2/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie);

        parentAttainment = res.body.data.attainment;

        res = await request
          .put(`/v1/courses/1/instances/1/attainments/${subAttainment.id}`)
          .send({ parentId: parentAttainment.id })
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(
          `parent attainment ID ${parentAttainment.id} does not belong ` +
        `to the same instance as attainment ID ${subAttainment.id}`
        );
      });

    it('should respond with 409 conflict, if attainment tries to refer itself in the parent id',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/1/instances/1/attainments/${subAttainment.id}`)
          .send({ ...subAttainment, parentId: subAttainment.id })
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe('attainment cannot refer to itself in the parent ID');
      });

    it('should respond with 422 unprocessable entity, if parent attainment does not exist',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/1/instances/1/attainments/${subAttainment.id}`)
          .send({ parentId: badId })
          .set('Content-Type', 'application/json')
          .set('Cookie', authCookie)
          .expect(HttpCode.UnprocessableEntity);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
      });

  });
