// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {
  AssessmentModelDataSchema,
  AttainmentData,
  EditAssessmentModelData,
  GraphStructure,
  HttpCode,
  NewAssessmentModelData,
} from '@common/types';
import {initGraph} from '@common/util/initGraph';
import {app} from '../../src/app';
import AssessmentModel from '../../src/database/models/assessmentModel';
import {courseCreator} from '../util/course';
import {cleanDb, setupDb} from '../util/dbReset';
import {Cookies, getCookies} from '../util/getCookies';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let courseAttainments: AttainmentData[] = [];
let assessmentModId = -1;
let testStructure: GraphStructure = {} as GraphStructure;

let NoModelscourseId = -1;
let noRoleCourseId = -1;
let noRoleModelId = -1;
const nonExistentId = 1000000;

const otherAssessmentModId = 1;

beforeAll(async () => {
  await setupDb();
  cookies = await getCookies();

  [courseId, courseAttainments, assessmentModId] =
    await courseCreator.createCourse({});
  await courseCreator.createAssessmentModel(courseId, courseAttainments);
  testStructure = initGraph('addition', courseAttainments);

  [NoModelscourseId] = await courseCreator.createCourse({
    createAssessmentModel: false,
  });

  let _; // To be able to use spread
  [noRoleCourseId, _, noRoleModelId] = await courseCreator.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
});

afterAll(async () => {
  await cleanDb();
});

// Helper functions
const checkModel = async (
  id: number,
  model: NewAssessmentModelData | EditAssessmentModelData
): Promise<void> => {
  const result = await AssessmentModel.findOne({where: {id, courseId}});

  expect(result).not.toBe(null);
  if (model.name !== undefined) expect(result?.name).toBe(model.name);
  if (model.graphStructure !== undefined)
    expect(result?.graphStructure).toStrictEqual(model.graphStructure);
};

const modelDoesNotExist = async (
  assessmentModelId: number,
  exists: boolean = false
): Promise<void> => {
  const result = await AssessmentModel.findOne({
    where: {id: assessmentModelId, courseId},
  });

  if (exists) expect(result).not.toBe(null);
  else expect(result).toBe(null);
};

describe('Test GET /v1/courses/:courseId/assessment-models/:assessmentModelId - get assessment model', () => {
  it('should respond with correct data when assessment model exists', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
      // cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/assessment-models/${assessmentModId}`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = AssessmentModelDataSchema.strict();
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${courseId}/assessment-models/${5.5}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();

    url = `/v1/courses/${-1}/assessment-models/${assessmentModId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/assessment-models/${assessmentModId}`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(
        `/v1/courses/${noRoleCourseId}/assessment-models/${noRoleModelId}`,
        [cookies.teacherCookie, cookies.assistantCookie, cookies.studentCookie]
      )
      .get();
  });

  it('should respond with 404 when not found', async () => {
    let url = `/v1/courses/${courseId}/assessment-models/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();

    url = `/v1/courses/${nonExistentId}/assessment-models/${assessmentModId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });

  it('should respond with 409 conflict when assessment model does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/assessment-models/${otherAssessmentModId}`;
    await responseTests.testConflict(url, cookies.adminCookie).get();
  });
});

describe('Test GET /v1/courses/:courseId/assessment-models - get all assessment models', () => {
  it('should respond with correct data when assessment models exists', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/assessment-models`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = z.array(AssessmentModelDataSchema.strict()).length(2);
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with correct data when no assessment models exist', async () => {
    const res = await request
      .get(`/v1/courses/${NoModelscourseId}/assessment-models`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(z.any()).length(0);
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${-1}/assessment-models`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/assessment-models`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(`/v1/courses/${courseId}/assessment-models`, [
        cookies.studentCookie,
      ])
      .get();
    await responseTests
      .testForbidden(`/v1/courses/${noRoleCourseId}/assessment-models`, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${nonExistentId}/assessment-models`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/assessment-models - add assessment model', () => {
  it('should add an assessment model when course exists', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];

    let i = 0;
    for (const cookie of testCookies) {
      const newModel = {name: `Model ${++i}`, graphStructure: testStructure};
      const res = await request
        .post(`/v1/courses/${courseId}/assessment-models`)
        .send(newModel)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      const Schema = z.number().int();
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
      if (result.success) await checkModel(result.data, newModel);
    }
  });

  it('should respond with 400 bad request if validation fails', async () => {
    const url = `/v1/courses/${courseId}/assessment-models`;
    const badRequest = responseTests.testBadRequest(url, cookies.adminCookie);

    await badRequest.post({name: 5, graphStructure: testStructure});
    await badRequest.post({name: {name: 'mod'}, graphStructure: testStructure});
    await badRequest.post(undefined);
    await badRequest.post({
      name: 'a name',
      graphStructure: {nodes: [], edges: [], nodeDat: {}},
    });
  });

  it('should respond with 400 bad request if id is invalid', async () => {
    const url = `/v1/courses/${-1}/assessment-models`;
    const data = {name: 'Not added', graphStructure: testStructure};
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/assessment-models`;
    const data = {name: 'Not added', graphStructure: testStructure};
    await responseTests.testUnauthorized(url).post(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .post(data);

    url = `/v1/courses/${noRoleCourseId}/assessment-models`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 404 not found when course does not exist', async () => {
    const url = `/v1/courses/${nonExistentId}/assessment-models`;
    const data = {name: 'Not added', graphStructure: testStructure};
    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 409 Conflict, if course already has assessment model with same name', async () => {
    const url = `/v1/courses/${courseId}/assessment-models`;
    const data = {name: 'Model 1', graphStructure: testStructure};
    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });
});

describe('Test Put /v1/courses/:courseId/assessment-models/:assessmentModId - edit an assessment model', () => {
  it('should edit an assessment model when course exists', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    let i = 0;
    for (const cookie of testCookies) {
      const editedModel: EditAssessmentModelData = {
        name: `Edited model ${i++}`,
        graphStructure: testStructure,
      };
      const res = await request
        .put(`/v1/courses/${courseId}/assessment-models/${assessmentModId}`)
        .send(editedModel)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkModel(assessmentModId, editedModel);
    }
  });

  it('should partially edit an assessment model when course exists (teacher in charge)', async () => {
    const data: EditAssessmentModelData[] = [
      {name: 'Edited 3 Addition model'},
      {graphStructure: testStructure},
    ];
    for (const editData of data) {
      const res = await request
        .put(`/v1/courses/${courseId}/assessment-models/${assessmentModId}`)
        .send(editData)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.teacherCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkModel(assessmentModId, editData);
    }
  });

  it('should respond with 400 bad request if validation fails', async () => {
    const url = `/v1/courses/${courseId}/assessment-models/${assessmentModId}`;
    const badRequest = responseTests.testBadRequest(url, cookies.adminCookie);

    await badRequest.put({name: 5, graphStructure: testStructure});
    await badRequest.put({name: {name: 'mod'}, graphStructure: testStructure});
    await badRequest.put({
      name: 'a name',
      graphStructure: {nodes: [], edges: [], nodeDat: {}},
    });
  });

  it('should respond with 400 bad request if id is invalid', async () => {
    let url = `/v1/courses/${courseId}/assessment-models/${'bad'}`;
    const data = {name: 'Not added', graphStructure: testStructure};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${1.5}/assessment-models/${assessmentModId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/assessment-models/${assessmentModId}`;
    const data = {name: 'Not edited', graphStructure: testStructure};
    await responseTests.testUnauthorized(url).put(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .put(data);

    url = `/v1/courses/${noRoleCourseId}/assessment-models/${noRoleModelId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 not found when course or model does not exist', async () => {
    let url = `/v1/courses/${courseId}/assessment-models/${nonExistentId}`;
    const data = {name: 'Not added', graphStructure: testStructure};
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${nonExistentId}/assessment-models/${assessmentModId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 conflict when assessment model does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/assessment-models/${otherAssessmentModId}`;
    const data = {name: 'Not added', graphStructure: testStructure};
    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });
});

describe('Test Delete /v1/courses/:courseId/assessment-models/:assessmentModId - delete an assessment model', () => {
  it('should delete an assessment model when course exists', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const modelId = await courseCreator.createAssessmentModel(
        courseId,
        courseAttainments
      );
      await checkModel(modelId, {}); // Validate that exists

      const res = await request
        .delete(`/v1/courses/${courseId}/assessment-models/${modelId}`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await modelDoesNotExist(modelId);
    }
  });

  it('should respond with 400 bad request if id is invalid', async () => {
    let url = `/v1/courses/${courseId}/assessment-models/${'bad'}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();

    url = `/v1/courses/${1.5}/assessment-models/${assessmentModId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/assessment-models/${assessmentModId}`;
    await responseTests.testUnauthorized(url).delete();

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .delete();

    url = `/v1/courses/${noRoleCourseId}/assessment-models/${noRoleModelId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 not found when course or model does not exist', async () => {
    let url = `/v1/courses/${courseId}/assessment-models/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();

    url = `/v1/courses/${nonExistentId}/assessment-models/${assessmentModId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 conflict when assessment model does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/assessment-models/${otherAssessmentModId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });
});
