// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

/* eslint @typescript-eslint/no-unsafe-member-access: off */

import supertest from 'supertest';
import {z} from 'zod';

import {AssessmentModelDataSchema, HttpCode} from '@common/types';
import {app} from '../../src/app';
import {AverageAssessmentModelGraphStructure} from '../mock-data/assessmentModel';
import {ErrorSchema, ZodErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);
let cookies: Cookies = {adminCookie: [], teacherCookie: []};

const normalId = 5;
const assessmentModId = 5;
const otherAssessmentModId = 1;
const noModelslId = 6;
const noTeacherId = 6;
const badId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();
});

describe(
  'Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId' +
    ' - get assessment model',
  () => {
    it('should respond with correct data when assessment model exists', async () => {
      const res = await request
        .get(`/v1/courses/${normalId}/assessment-models/${assessmentModId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = await AssessmentModelDataSchema.strict().safeParseAsync(
        res.body
      );
      expect(result.success).toBeTruthy();
    });

    it('should respond with 404 not found when assessment model does not exist', async () => {
      const res = await request
        .get(`/v1/courses/${normalId}/assessment-models/${badId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      const result = await ErrorSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    });

    it('should respond with 404 not found when course does not exist', async () => {
      const res = await request
        .get(`/v1/courses/${badId}/assessment-models/${assessmentModId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      const result = await ErrorSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    });

    it('should respond with 409 conflict when assessment model does not belong to course', async () => {
      const res = await request
        .get(
          `/v1/courses/${normalId}/assessment-models/${otherAssessmentModId}`
        )
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Conflict);

      const result = await ErrorSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    });
  }
);

describe('Test GET /v1/courses/:courseId/assessment-models - get all assessment models', () => {
  it('should respond with correct data when assessment models exist', async () => {
    const res = await request
      .get(`/v1/courses/${normalId}/assessment-models`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(AssessmentModelDataSchema.strict()).nonempty();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with correct data when no assessment models exist', async () => {
    const res = await request
      .get(`/v1/courses/${noModelslId}/assessment-models`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(z.any()).length(0);
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found when course does not exist', async () => {
    const res = await request
      .get(`/v1/courses/${badId}/assessment-models`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test POST /v1/courses/:courseId/assessment-models - add assessment model', () => {
  it('should add an assessment model when course exists (admin user)', async () => {
    const res = await request
      .post(`/v1/courses/${normalId}/assessment-models`)
      .send({
        name: 'New model',
        graphStructure: AverageAssessmentModelGraphStructure,
      })
      .set('Content-Type', 'application/json')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const Schema = z.number().int();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should add an assessment model when course exists (teacher in charge)', async () => {
    const res = await request
      .post(`/v1/courses/${normalId}/assessment-models`)
      .send({
        name: 'New model 2',
        graphStructure: AverageAssessmentModelGraphStructure,
      })
      .set('Content-Type', 'application/json')
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const Schema = z.number().int();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request if validation fails', async () => {
    const badInput = async (input: unknown): Promise<void> => {
      const res = await request
        .post(`/v1/courses/${normalId}/assessment-models`)
        .send(input as object)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      const Schema = z.union([ErrorSchema, ZodErrorSchema]);
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    };

    await badInput({
      name: 5,
      graphStructure: AverageAssessmentModelGraphStructure,
    });
    await badInput({
      name: {name: 'string'},
      graphStructure: AverageAssessmentModelGraphStructure,
    });
    await badInput(10);
    await badInput({
      name: 'a name',
      graphStructure: {nodes: [], edges: [], nodeDat: {}},
    });
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .post(`/v1/courses/${normalId}/assessment-models`)
      .send({
        name: 'Not added',
        graphStructure: AverageAssessmentModelGraphStructure,
      })
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .post(`/v1/courses/${noTeacherId}/assessment-models`)
      .send({
        name: 'Not added',
        graphStructure: AverageAssessmentModelGraphStructure,
      })
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found when course does not exist', async () => {
    const res = await request
      .post(`/v1/courses/${badId}/assessment-models`)
      .send({
        name: 'Not added',
        graphStructure: AverageAssessmentModelGraphStructure,
      })
      .set('Content-Type', 'application/json')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 409 Conflict, if course already has assessment model with same name', async () => {
    const res = await request
      .post(`/v1/courses/${normalId}/assessment-models`)
      .send({
        name: 'New model',
        graphStructure: AverageAssessmentModelGraphStructure,
      })
      .set('Content-Type', 'application/json')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Conflict);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});
