// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import Attainment from '../../src/database/models/attainment';

import { mockAttainment } from '../mock-data/attainment';
import { app } from '../../src/app';
import { AttainmentData } from '../../src/types/attainment';
import { HttpCode } from '../../src/types/httpCode';
import { Cookies, getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
const badInput: string = 'notValid';
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

beforeAll(async () => {
  cookies = await getCookies();
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
          .set('Cookie', cookies.adminCookie)
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
          .post('/v1/courses/2/instances/2/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.attainment.id).toBeDefined();
        expect(res.body.data.attainment.courseId).toBe(2);
        expect(res.body.data.attainment.courseInstanceId).toBe(2);
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
        .post('/v1/courses/3/instances/3/attainments')
        .send({ parentId: 3, ...mockAttainment })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.parentId).toBe(3);

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
          .set('Cookie', cookies.adminCookie)
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
          .set('Cookie', cookies.adminCookie)
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
          .post('/v1/courses/3/instances/4/attainments')
          .send({ parentId: badInput, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
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
          .post('/v1/courses/3/instances/4/attainments')
          .send({ ...mockAttainment, date: badInput, })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
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
          .post('/v1/courses/3/instances/4/attainments')
          .send({ ...mockAttainment, expiryDate: badInput, })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
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
          .post('/v1/courses/3/instances/4/attainments')
          .send({
            ...mockAttainment, subAttainments: [
              {
                name: 'Exercise 1',
                tag: 'tag-for-bad-input',
                date: badInput,
                expiryDate: new Date(2024, 8, 14),
                subAttainments: [],
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);

        // Validate on level 2
        res = await request
          .post('/v1/courses/3/instances/4/attainments')
          .send({
            ...mockAttainment, subAttainments: [
              {
                name: 'Exercise 1',
                tag: 'test-ex-1-1',
                date: new Date(2024, 8, 14),
                expiryDate: new Date(2024, 8, 14),
                subAttainments: [
                  {
                    name: 'Exercise 1',
                    tag: 'test-ex-1-2',
                    date: new Date(2024, 8, 14),
                    expiryDate: new Date(2024, 8, 14),
                    subAttainments: badInput,
                  }
                ],
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);

        // Validate on level 3
        res = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({
            ...mockAttainment, subAttainments: [
              {
                name: 'Exercise 1',
                tag: 'test-ex-1-3',
                date: new Date(2024, 8, 14),
                expiryDate: new Date(2024, 8, 14),
                subAttainments: [
                  {
                    name: 'Exercise 1',
                    tag: 'test-ex-1-4',
                    date: new Date(2024, 8, 14),
                    expiryDate: new Date(2024, 8, 14),
                    subAttainments: [
                      {
                        name: 'Exercise 1',
                        tag: 'test-ex-1-5',
                        date: new Date(2024, 8, 14),
                        expiryDate: badInput,
                        subAttainments: [],
                      }
                    ],
                  }
                ],
              }
            ]
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toEqual(1);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .post('/v1/courses/1/instances/1/attainments')
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 404 not found, if course instance does not exist',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/1/instances/${badId}/attainments`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
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
          .set('Cookie', cookies.adminCookie)
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
          .set('Cookie', cookies.adminCookie)
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
          .post('/v1/courses/4/instances/5/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json');

        const id: number = Number(res.body.data.attainment.id);

        // Try to add new attainment with previously created parent to instance 2.
        res = await request
          .post('/v1/courses/4/instances/6/attainments')
          .send({ parentId: id, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(
          `parent attainment ID ${id} does not belong to the course instance ID 6`
        );
      });

    it('should respond with 422 unprocessable entity, if parent attainment does not exist',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/instances/1/attainments')
          .send({ parentId: badId, ...mockAttainment })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
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
        .post('/v1/courses/4/instances/7/attainments').send(tree)
        .set('Cookie', cookies.adminCookie);

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
        .delete(`/v1/courses/4/instances/7/attainments/${rootAttainment}`)
        .set('Cookie', cookies.adminCookie)
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
        .post('/v1/courses/4/instances/7/attainments')
        .send(
          {
            name: 'Test exercise',
            tag: 'delete-test-1',
            date: new Date(),
            expiryDate: new Date(),
            subAttainments: []
          }
        )
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json');

      // Verify that the attainment was added.
      const addedAttainment: number = add.body.data.attainment.id;
      expect(await Attainment.findByPk(addedAttainment)).not.toBeNull;

      // Delete the added attainment.
      const res: supertest.Response = await request
        .delete(`/v1/courses/4/instances/7/attainments/${addedAttainment}`)
        .set('Cookie', cookies.adminCookie)
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
          tag: 'delete-test-2',
          date: new Date(),
          expiryDate: new Date(),
          subAttainments: [
            {
              name: 'Test exercise 1.1',
              tag: 'delete-test-2-1.1',
              date: new Date(),
              expiryDate: new Date(),
              subAttainments: []
            },
            {
              name: 'Test exercise 1.2',
              tag: 'delete-test-2-1.2',
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
      await request
        .delete('/v1/courses/4/instances/7/attainments/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 404 not found for non-existent attainment ID', async () => {
      const res: supertest.Response = await request
        .delete(`/v1/courses/4/instances/7/attainments/${badId}`)
        .set('Cookie', cookies.adminCookie)
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
        .post('/v1/courses/1/instances/12/attainments')
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      subAttainment = res.body.data.attainment;

      res = await request
        .put(`/v1/courses/1/instances/12/attainments/${subAttainment.id}`)
        .send({
          name: 'new name',
          tag: 'new tag',
          date: mockAttainment.date,
          expiryDate: mockAttainment.expiryDate
        })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.id).toBe(subAttainment.id);
      expect(res.body.data.attainment.courseId).toBe(1);
      expect(res.body.data.attainment.courseInstanceId).toBe(12);
      expect(res.body.data.attainment.parentId).toBe(null);
      expect(res.body.data.attainment.name).toBe('new name');
      expect(res.body.data.attainment.tag).toBe('new tag');
      expect(new Date(res.body.data.attainment.date).getTime())
        .toBe(mockAttainment.date.getTime());
      expect(new Date(res.body.data.attainment.expiryDate).getTime())
        .toBe(mockAttainment.expiryDate.getTime());
    });

    it('should add parent succesfully on an existing attainment', async () => {
      // Create a new parent attainment.
      let res: supertest.Response = await request
        .post('/v1/courses/1/instances/12/attainments')
        .send({
          name: 'No parent',
          tag: 'no-parent',
          date: new Date(2024, 4, 5),
          expiryDate: new Date (2025, 4, 5)
        })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.Ok);

      parentAttainment = res.body.data.attainment;

      res = await request
        .put(`/v1/courses/1/instances/12/attainments/${subAttainment.id}`)
        .send({ parentId: parentAttainment.id })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.attainment.id).toBe(subAttainment.id);
      expect(res.body.data.attainment.courseId).toBe(1);
      expect(res.body.data.attainment.courseInstanceId).toBe(12);
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
          .set('Cookie', cookies.adminCookie)
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
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 400 bad request, if validation fails (non-number attainment id)',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/2/instances/11/attainments/${badInput}`)
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
        expect(res.body.errors.length).toBeGreaterThanOrEqual(1);
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .put('/v1/courses/2/instances/11/attainments/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 404 not found, if attainment does not exist', async () => {
      const res: supertest.Response = await request
        .put(`/v1/courses/2/instances/11/attainments/${badId}`)
        .send(mockAttainment)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
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
          .post('/v1/courses/4/instances/13/attainments')
          .send(mockAttainment)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.Ok);

        parentAttainment = res.body.data.attainment;

        res = await request
          .put(`/v1/courses/1/instances/12/attainments/${subAttainment.id}`)
          .send({ parentId: parentAttainment.id })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
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
          .put(`/v1/courses/2/instances/11/attainments/${subAttainment.id}`)
          .send({ ...subAttainment, parentId: subAttainment.id })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe('attainment cannot refer to itself in the parent ID');
      });

    it('should respond with 422 unprocessable entity, if parent attainment does not exist',
      async () => {
        const res: supertest.Response = await request
          .put(`/v1/courses/2/instances/11/attainments/${subAttainment.id}`)
          .send({ parentId: badId })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .expect(HttpCode.UnprocessableEntity);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toBe(`study attainment with ID ${badId} not found`);
      });

  });

function verifyAttainmentData(
  data: AttainmentData,
  id: number,
  courseId: number,
  courseInstanceId: number,
  subAttainments: boolean
): void {
  expect(data.id).toBe(id);
  expect(data.courseId).toBe(courseId);
  expect(data.courseInstanceId).toBe(courseInstanceId);
  expect(data.tag).toBeDefined();
  expect(data.name).toBeDefined();
  expect(data.date).toBeDefined();
  expect(data.expiryDate).toBeDefined();
  if (subAttainments)
    expect(data.subAttainments).toBeDefined();
  else
    expect(data.subAttainments).not.toBeDefined();
}

describe(
  'Test GET /v1/courses/:courseId/instances/:instanceId/attainments/:attainmentId'
  + '- get attainment (tree)',
  () => {

    it('should respond with a single attainment without subattainments, '
      + 'if query string is not present', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments/2')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 2, 2, 2, false);
    });

    it('should respond with a single attainment with one level of subattainments, '
      + 'if "tree" parameter in query equals "children"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments/2?tree=children')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 2, 2, 2, true);
      verifyAttainmentData(res.body.data.subAttainments[1], 6, 2, 2, false);
      verifyAttainmentData(res.body.data.subAttainments[0], 10, 2, 2, false);

    });

    it('should respond with a single attainment with a full tree of subattainments, '
      + 'if "tree" parameter in query equals "descendants"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments/2?tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data, 2, 2, 2, true);
      verifyAttainmentData(res.body.data.subAttainments[1], 6, 2, 2, true);
      verifyAttainmentData(
        res.body.data.subAttainments[1].subAttainments[0],
        214,
        2,
        2,
        true
      );
      verifyAttainmentData(
        res.body.data.subAttainments[1].subAttainments[0].subAttainments[0],
        215,
        2,
        2,
        false
      );
      verifyAttainmentData(res.body.data.subAttainments[0], 10, 2, 2, false);

    });

    it('should respond with 400 Bad Request, if "tree" parameter in query string '
      + 'is invalid', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments/2?tree=fail')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('tree must be one of the '
        + 'following values: children, descendants');
    });

    it('should respond with 400 Bad Request, if "tree" parameter is given twice '
      + '(array instead of string)', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments/2?tree=children&tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('tree must be a `string` type, but the final value was: '
        + '`[\n  "\\"children\\"",\n  "\\"descendants\\""\n]`.');
    });

    it('should respond with 400 Bad Request, if unknown parameters are present '
      + 'in query string', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments/2?tree=children&foo=bar')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('this field has unspecified keys: foo');
    });

    it('should respond with 404 Not Found, if the attainment is not found '
      + 'for the specified course and instance', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/instances/1/attainments/2')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('Attainment with id 2 was not found for '
        + 'the specified course and instance');
    });
  });

describe(
  'Test GET /v1/courses/:courseId/instances/:instanceId/attainments'
  + '- get root attainments of an instance (optionally with a tree of descendants)',
  () => {

    it('should respond with an array of root attainments without subattainments, '
      + 'if query string is not present', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data[1], 2, 2, 2, false);
      verifyAttainmentData(res.body.data[2], 216, 2, 2, false);
      verifyAttainmentData(res.body.data[3], 217, 2, 2, false);
    });

    it('should respond with an array of root attainments with one level of subattainments, '
      + 'if "tree" parameter in query equals "children"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments?tree=children')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data[1], 2, 2, 2, true);
      verifyAttainmentData(res.body.data[1].subAttainments[1], 6, 2, 2, false);
      verifyAttainmentData(res.body.data[1].subAttainments[0], 10, 2, 2, false);
      verifyAttainmentData(res.body.data[2], 216, 2, 2, false);
      verifyAttainmentData(res.body.data[3], 217, 2, 2, true);
      verifyAttainmentData(res.body.data[3].subAttainments[0], 218, 2, 2, false);
    });

    it('should respond with an array of root attainments with a full tree of subattainments, '
      + 'if "tree" parameter in query equals "descendants"', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments?tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      verifyAttainmentData(res.body.data[1], 2, 2, 2, true);
      verifyAttainmentData(res.body.data[1].subAttainments[1], 6, 2, 2, true);
      verifyAttainmentData(
        res.body.data[1].subAttainments[1].subAttainments[0],
        214,
        2,
        2,
        true
      );
      verifyAttainmentData(
        res.body.data[1].subAttainments[1].subAttainments[0].subAttainments[0],
        215,
        2,
        2,
        false
      );
      verifyAttainmentData(res.body.data[1].subAttainments[0], 10, 2, 2, false);
      verifyAttainmentData(res.body.data[2], 216, 2, 2, false);
      verifyAttainmentData(res.body.data[3], 217, 2, 2, true);
      verifyAttainmentData(res.body.data[3].subAttainments[0], 218, 2, 2, false);
    });

    it('should respond with 400 Bad Request, if "tree" parameter in query string '
      + 'is invalid', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments?tree=fail')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('tree must be one of the '
        + 'following values: children, descendants');
    });

    it('should respond with 400 Bad Request, if "tree" parameter is given twice '
      + '(array instead of string)', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments?tree=children&tree=descendants')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('tree must be a `string` type, but the final value was: '
        + '`[\n  "\\"children\\"",\n  "\\"descendants\\""\n]`.');
    });

    it('should respond with 400 Bad Request, if unknown parameters are present '
      + 'in query string', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/2/instances/2/attainments?tree=children&foo=bar')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('this field has unspecified keys: foo');
    });

    it('should respond with 404 Not Found, if no attainments were found '
      + 'for the specified course and instance', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/100/instances/100/attainments')
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0]).toBe('Attainments were not found for the '
        + 'specified course and instance');
    });

  });
