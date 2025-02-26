// SPDX-FileCopyrightText: 2024 The Ossi Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {
  type CoursePartData,
  type CourseTaskData,
  type EditGradingModelData,
  GradingModelDataArraySchema,
  GradingModelDataSchema,
  type GraphStructure,
  HttpCode,
  IdSchema,
  type NewGradingModelData,
} from '@/common/types';
import {initGraph} from '@/common/util';
import {app} from '../../src/app';
import GradingModel from '../../src/database/models/gradingModel';
import {createData} from '../util/createData';
import {TEACHER_ID} from '../util/general';
import {type Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let courseParts: CoursePartData[] = [];
let courseTasks: CourseTaskData[] = [];
let gradingModId = -1;
let finalGradeStructure: GraphStructure = {} as GraphStructure;

let noModelsCourseId = -1;
let noRoleCourseId = -1;
let noRoleModelId = -1;
const nonExistentId = 1000000;

const otherGradingModId = 1;

beforeAll(async () => {
  cookies = await getCookies();

  [courseId, courseParts, courseTasks, gradingModId] =
    await createData.createCourse({});
  await createData.createGradingModel(courseId, courseParts, courseTasks);
  finalGradeStructure = initGraph('addition', courseParts);

  [noModelsCourseId] = await createData.createCourse({
    createGradingModel: false,
  });

  [noRoleCourseId, , , noRoleModelId] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
});

afterAll(async () => {
  await resetDb();
});

// Helper functions
const checkModel = async (
  id: number,
  model: NewGradingModelData | EditGradingModelData
): Promise<void> => {
  const result = await GradingModel.findOne({where: {id, courseId}});

  expect(result).not.toBe(null);
  if (model.name !== undefined) expect(result?.name).toBe(model.name);
  if (model.graphStructure !== undefined)
    expect(result?.graphStructure).toStrictEqual(model.graphStructure);
};

const modelDoesNotExist = async (
  gradingModelId: number,
  exists: boolean = false
): Promise<void> => {
  const result = await GradingModel.findOne({
    where: {id: gradingModelId, courseId},
  });

  if (exists) expect(result).not.toBe(null);
  else expect(result).toBe(null);
};

describe('Test GET /v1/courses/:courseId/grading-models/:gradingModelId - get grading model', () => {
  it('should get the grading model', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
      // cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/grading-models/${gradingModId}`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = GradingModelDataSchema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${courseId}/grading-models/5.5`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();

    url = `/v1/courses/${-1}/grading-models/${gradingModId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/grading-models/${gradingModId}`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(
        `/v1/courses/${noRoleCourseId}/grading-models/${noRoleModelId}`,
        [cookies.teacherCookie, cookies.assistantCookie, cookies.studentCookie]
      )
      .get();
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${courseId}/grading-models/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();

    url = `/v1/courses/${nonExistentId}/grading-models/${gradingModId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });

  it('should respond with 409 when grading model does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/grading-models/${otherGradingModId}`;
    await responseTests.testConflict(url, cookies.adminCookie).get();
  });
});

describe('Test GET /v1/courses/:courseId/grading-models - get all grading models', () => {
  it('should get the grading models', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/grading-models`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = GradingModelDataArraySchema.length(2);
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should get the grading models when no grading models exist', async () => {
    const res = await request
      .get(`/v1/courses/${noModelsCourseId}/grading-models`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = GradingModelDataArraySchema.length(0);
    const result = Schema.safeParse(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${-1}/grading-models`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/grading-models`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(`/v1/courses/${courseId}/grading-models`, [
        cookies.studentCookie,
      ])
      .get();
    await responseTests
      .testForbidden(`/v1/courses/${noRoleCourseId}/grading-models`, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/courses/${nonExistentId}/grading-models`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/grading-models - add grading model', () => {
  it('should add a grading model', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];

    let i = 0;
    for (const cookie of testCookies) {
      const newModel = {
        name: `Model ${++i}`,
        coursePartId: null,
        graphStructure: finalGradeStructure,
      };
      const res = await request
        .post(`/v1/courses/${courseId}/grading-models`)
        .send(newModel)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      const result = IdSchema.safeParse(res.body);
      expect(result.success).toBeTruthy();
      if (result.success) await checkModel(result.data, newModel);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${-1}/grading-models`;
    const data = {
      name: 'Not added',
      coursePartId: null,
      graphStructure: finalGradeStructure,
    };
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/grading-models`;
    const data = {
      name: 'Not added',
      coursePartId: null,
      graphStructure: finalGradeStructure,
    };
    await responseTests.testUnauthorized(url).post(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .post(data);

    url = `/v1/courses/${noRoleCourseId}/grading-models`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/courses/${nonExistentId}/grading-models`;
    const data = {
      name: 'Not added',
      coursePartId: null,
      graphStructure: finalGradeStructure,
    };
    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 409 when course already has grading model with same name', async () => {
    const url = `/v1/courses/${courseId}/grading-models`;
    const data = {
      name: 'Model 1',
      coursePartId: null,
      graphStructure: finalGradeStructure,
    };
    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });
});

describe('Test Put /v1/courses/:courseId/grading-models/:gradingModId - edit a grading model', () => {
  it('should edit a grading model', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    let i = 0;
    for (const cookie of testCookies) {
      const editedModel: EditGradingModelData = {
        name: `Edited model ${i++}`,
        graphStructure: finalGradeStructure,
      };
      const res = await request
        .put(`/v1/courses/${courseId}/grading-models/${gradingModId}`)
        .send(editedModel)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkModel(gradingModId, editedModel);
    }
  });

  it('should partially edit a grading model', async () => {
    const data: EditGradingModelData[] = [
      {name: 'Edited 3 addition model'},
      {graphStructure: finalGradeStructure},
    ];
    for (const editData of data) {
      const res = await request
        .put(`/v1/courses/${courseId}/grading-models/${gradingModId}`)
        .send(editData)
        .set('Content-Type', 'application/json')
        .set('Cookie', cookies.teacherCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkModel(gradingModId, editData);
    }
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/grading-models/${gradingModId}`;
    const badRequest = responseTests.testBadRequest(url, cookies.adminCookie);

    await badRequest.put({name: 5, graphStructure: finalGradeStructure});
    await badRequest.put({
      name: {name: 'mod'},
      graphStructure: finalGradeStructure,
    });
    await badRequest.put({
      name: 'a name',
      graphStructure: {nodes: [], edges: [], nodeDat: {}},
    });
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${courseId}/grading-models/bad`;
    const data = {name: 'Not added', graphStructure: finalGradeStructure};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    url = `/v1/courses/1.5/grading-models/${gradingModId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/grading-models/${gradingModId}`;
    const data = {name: 'Not edited', graphStructure: finalGradeStructure};
    await responseTests.testUnauthorized(url).put(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .put(data);

    url = `/v1/courses/${noRoleCourseId}/grading-models/${noRoleModelId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${courseId}/grading-models/${nonExistentId}`;
    const data = {name: 'Not added', graphStructure: finalGradeStructure};
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${nonExistentId}/grading-models/${gradingModId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 conflict when grading model does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/grading-models/${otherGradingModId}`;
    const data = {name: 'Not added', graphStructure: finalGradeStructure};
    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 when course already has grading model with same name', async () => {
    const url = `/v1/courses/${courseId}/grading-models/${gradingModId}`;
    const data = {name: 'Model 1', graphStructure: finalGradeStructure};
    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });
});

describe('Test DELETE /v1/courses/:courseId/grading-models/:gradingModId - delete a grading model', () => {
  it('should delete a grading model', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const modelId = await createData.createGradingModel(
        courseId,
        courseParts,
        courseTasks
      );
      await checkModel(modelId, {}); // Validate that exists

      const res = await request
        .delete(`/v1/courses/${courseId}/grading-models/${modelId}`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await modelDoesNotExist(modelId);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${courseId}/grading-models/bad`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();

    url = `/v1/courses/1.5/grading-models/${gradingModId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/grading-models/${gradingModId}`;
    await responseTests.testUnauthorized(url).delete();

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .delete();

    url = `/v1/courses/${noRoleCourseId}/grading-models/${noRoleModelId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${courseId}/grading-models/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();

    url = `/v1/courses/${nonExistentId}/grading-models/${gradingModId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 conflict when grading model does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/grading-models/${otherGradingModId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 conflict when trying to delete a grading model with final grades', async () => {
    const modelId = await createData.createGradingModel(
      courseId,
      courseParts,
      courseTasks
    );
    const user = await createData.createUser();
    await createData.createFinalGrade(courseId, user.id, modelId, TEACHER_ID);

    const url = `/v1/courses/${courseId}/grading-models/${modelId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });
});
