// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import TeacherInCharge from '../../src/database/models/teacherInCharge';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { Cookies, getCookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
const badId: number = 1000000;
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};
const mockTeacher: TeacherInCharge = new TeacherInCharge({
  userId: 1,
  courseId: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}, { isNewRecord: false });

beforeAll(async () => {
  cookies = await getCookies();
});

describe(
  'Test GET /v1/courses/:courseId/instances/:instanceId - get instance data with instance id',
  () => {

    it('should respond with correct data when course instance exists', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/instances/1')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courseInstance).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.courseInstance.id).toBe(1);
      expect(res.body.data.courseInstance.assessmentModelId).toBe(1);
      expect(res.body.data.courseInstance.startingPeriod).toBeDefined();
      expect(res.body.data.courseInstance.endingPeriod).toBeDefined();
      expect(res.body.data.courseInstance.startDate).toBeDefined();
      expect(res.body.data.courseInstance.endDate).toBeDefined();
      expect(res.body.data.courseInstance.type).toBeDefined();
      expect(res.body.data.courseInstance.gradingScale).toBeDefined();
      expect(res.body.data.courseInstance.courseData.courseCode).toBeDefined();
      expect(res.body.data.courseInstance.courseData.minCredits).toBeDefined();
      expect(res.body.data.courseInstance.courseData.maxCredits).toBeDefined();
      expect(res.body.data.courseInstance.courseData.teachersInCharge).toBeDefined();
      expect(res.body.data.courseInstance.courseData.teachersInCharge[0].name).toBeDefined();
      expect(res.body.data.courseInstance.courseData.department).toBeDefined();
      expect(res.body.data.courseInstance.courseData.name).toBeDefined();
      expect(res.body.data.courseInstance.courseData.evaluationInformation).toBeDefined();
    });

    it('should respond with 400 bad request, if validation fails (non-number instance id)',
      async () => {
        const res: supertest.Response = await request
          .get('/v1/courses/1/instances/abc')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadRequest);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .get('/v1/courses/1/instances/1')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 404 not found, with nonexistent course instance ID', async () => {
      const res: supertest.Response = await request
        .get(`/v1/courses/1/instances/${badId}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 409 conflict, when the instance ID does not match the course ID',
      async () => {
        const res: supertest.Response = await request
          .get('/v1/courses/2/instances/1')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Conflict);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
      });

  });

describe(
  'Test GET /v1/courses/:courseId/instances - get all instances belonging to course',
  () => {

    it('should respond with correct data', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/1/instances')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courseInstances[0].assessmentModelId).toBeDefined();
      expect(res.body.data.courseInstances[0].courseData.id).toBeDefined();
      expect(res.body.data.courseInstances[0].courseData.courseCode).toBeDefined();
      expect(res.body.data.courseInstances[0].courseData.teachersInCharge).toBeDefined();
      expect(res.body.data.courseInstances[0].id).toBeDefined();
      expect(res.body.data.courseInstances[0].sisuCourseInstanceId).toBeDefined();
      expect(res.body.data.courseInstances[0].startingPeriod).toBeDefined();
      expect(res.body.data.courseInstances[0].endingPeriod).toBeDefined();
      expect(res.body.data.courseInstances[0].startDate).toBeDefined();
      expect(res.body.data.courseInstances[0].endDate).toBeDefined();
      expect(res.body.data.courseInstances[0].type).toBeDefined();
      expect(res.body.data.courseInstances[0].gradingScale).toBeDefined();
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .get('/v1/courses/1/instances')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 400 bad request, if courseId is not a number', async () => {
      const res: supertest.Response = await request
        .get('/v1/courses/a/instances')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it('should respond with 404 not found, if course does not exist', async () => {
      const res: supertest.Response = await request
        .get(`/v1/courses/${badId}/instances`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.NotFound);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

  });

describe('Test POST /v1/courses/:courseId/instances - create new course instance', () => {

  it('should create new instance with correct input (admin user)', async () => {
    async function goodInput(input: object): Promise<void> {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances')
        .send(input)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.courseInstance.id).toBeDefined();
    }

    await goodInput({
      gradingScale: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await goodInput({
      gradingScale: 'PASS_FAIL',
      startingPeriod: 'III',
      endingPeriod: 'V',
      type: 'EXAM',
      startDate: '2023-1-19',
      endDate: '2024-4-8'
    });

    await goodInput({
      assessmentModelId: 1,
      gradingScale: 'PASS_FAIL',
      startingPeriod: 'III',
      endingPeriod: 'V',
      type: 'EXAM',
      startDate: '2023-1-19',
      endDate: '2024-4-8'
    });
  });

  it(
    'should create new instance with correct input (teacher in charge)',
    async () => {
      jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

      const res: supertest.Response = await request
        .post('/v1/courses/1/instances')
        .send({
          gradingScale: 'NUMERICAL',
          startingPeriod: 'I',
          endingPeriod: 'II',
          type: 'LECTURE',
          startDate: '2022-7-10',
          endDate: '2022-11-10'
        })
        .set('Cookie', cookies.userCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.errors).not.toBeDefined();
      expect(res.body.data.courseInstance.id).toBeDefined();
    });

  it('should respond with 400 bad request, if incorrect input', async () => {
    async function badInput(input: object): Promise<void> {
      const res: supertest.Response = await request
        .post('/v1/courses/1/instances')
        .send(input)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    }

    await badInput({
      foo: 'bar'
    });

    await badInput({
      gradingScale: 'Wrong enum',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingScale: 'PASS_FAIL',
      startingPeriod: {
        junk: 'data'
      },
      endingPeriod: 'II',
      type: 'LECTURE',
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingScale: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      type: 'LECTURE',
      startDate: 'not a date',
      endDate: 'not a date either'
    });

  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .post('/v1/courses/1/instances')
      .send({})
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/1/instances')
      .send({
        gradingScale: 'NUMERICAL',
        startingPeriod: 'I',
        endingPeriod: 'II',
        type: 'LECTURE',
        startDate: '2022-7-10',
        endDate: '2022-11-10'
      })
      .set('Cookie', cookies.userCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

  it('should respond with 404 not found, if nonexistent course ID', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses/9999999/instances')
      .send({
        gradingScale: 'NUMERICAL',
        startingPeriod: 'I',
        endingPeriod: 'II',
        type: 'LECTURE',
        teachersInCharge: [1],
        startDate: '2022-7-10',
        endDate: '2022-11-10'
      })
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

});
