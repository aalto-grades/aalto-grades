// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { Cookies, getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

beforeAll(async () => {
  cookies = await getCookies();
});

describe(
  'Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId'
  + ' - get assessment model',
  () => {

    it('should respond with correct data when assessment model exists', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/assessment-models/1')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.assessmentModel.id).toBeDefined();
      expect(res.body.data.assessmentModel.courseId).toBeDefined();
      expect(res.body.data.assessmentModel.name).toBeDefined();
    });

    it('should respond with 404 not found when assessment model does not exist',
      async () => {
        const res: supertest.Response = await request
          .get(`/v1/courses/1/assessment-models/${badId}`)
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.NotFound);

        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.data).not.toBeDefined();
      }
    );

    it('should respond with 404 not found when course does not exist',
      async () => {
        const res: supertest.Response = await request
          .get(`/v1/courses/${badId}/assessment-models/1`)
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.NotFound);

        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.data).not.toBeDefined();
      }
    );

    it('should respond with 409 conflict when assessment model does not belong to course',
      async () => {
        const res: supertest.Response = await request
          .get('/v1/courses/1/assessment-models/2')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.data).not.toBeDefined();
      }
    );
  }
);

describe(
  'Test GET /v1/courses/:courseId/assessment-models - get all assessment models',
  () => {

    it('should respond with correct data when assessment models exist', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/assessment-models')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.assessmentModels).toBeDefined();
      expect(res.body.data.assessmentModels[0].id).toBeDefined();
      expect(res.body.data.assessmentModels[0].courseId).toBeDefined();
      expect(res.body.data.assessmentModels[0].name).toBeDefined();
    });

    it('should respond with correct data when no assessment models exist', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/7/assessment-models')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.assessmentModels).toBeDefined();
      expect(res.body.data.assessmentModels.length).toBe(0);
    });

    it('should respond with 404 not found when course does not exist',
      async () => {
        const res: supertest.Response = await request
          .get(`/v1/courses/${badId}/assessment-models`)
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.NotFound);

        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.data).not.toBeDefined();
      }
    );
  }
);

describe(
  'XXX Test POST /v1/courses/:courseId/assessment-models - add assessment model',
  () => {

    it('should add an assessment model when course exists (admin user)', async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/assessment-models')
        .send({
          name: 'new-model-1'
        })
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data).toBeDefined();
      expect(res.body.data.assessmentModel).toBeDefined();
      expect(res.body.data.assessmentModel.id).toBeDefined();
    });

    it(
      'should add an assessment model when course exists (teacher in charge of the course)',
      async () => {
        const res: supertest.Response = await request
          .post('/v1/courses/1/assessment-models')
          .send({
            name: 'new-model-2'
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.userCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data).toBeDefined();
        expect(res.body.data.assessmentModel).toBeDefined();
        expect(res.body.data.assessmentModel.id).toBeDefined();
      });

    it('should respond with 400 bad request if validation fails', async () => {
      async function badInput(input: unknown): Promise<void> {
        const res: supertest.Response = await request
          .post('/v1/courses/1/assessment-models')
          .send(input as object)
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.data).not.toBeDefined();
      }

      await badInput({ name: 5 });
      await badInput({ name: { name: 'string' } });
      await badInput(10);
      await badInput({ nam: 'a name' });
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .post('/v1/courses/1/assessment-models')
        .send({})
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
      const res: supertest.Response = await request
        .post('/v1/courses/1/assessment-models')
        .send({
          name: 'new-model'
        })
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Forbidden);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found when course does not exist',
      async () => {
        const res: supertest.Response = await request
          .post(`/v1/courses/${badId}/assessment-models`)
          .send({
            name: 'new-model'
          })
          .set('Content-Type', 'application/json')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.NotFound);

        expect(res.body.success).toBe(false);
        expect(res.body.errors).toBeDefined();
        expect(res.body.data).not.toBeDefined();
      }
    );
  }
);
