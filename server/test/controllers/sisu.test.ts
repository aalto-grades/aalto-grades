// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, { AxiosStatic } from 'axios';
import supertest from 'supertest';

import { app } from '../../src/app';

import { CourseInstanceData } from 'aalto-grades-common/types/course';
import { HttpCode } from '../../src/types/httpCode';
import { sisuInstance, sisuError } from '../mockData/sisu';
import { Cookies, getCookies } from '../util/getCookies';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const request: supertest.SuperTest<supertest.Test> = supertest(app);
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

beforeAll(async () => {
  cookies = await getCookies();
});

function checkRes(courseInstance: CourseInstanceData): void {
  expect(courseInstance.id).toBeDefined();
  expect(courseInstance.sisuCourseInstanceId).toBe(sisuInstance.id);
  expect(courseInstance.startingPeriod).toBeDefined();
  expect(courseInstance.endingPeriod).toBeDefined();
  expect(courseInstance.minCredits).toBeDefined();
  expect(courseInstance.maxCredits).toBeDefined();
  expect(courseInstance.startDate).toBeDefined();
  expect(courseInstance.endDate).toBeDefined();
  expect(courseInstance.type).toBeDefined();
  expect(courseInstance.gradingScale).toBeDefined();
  expect(courseInstance.teachersInCharge).toBeDefined();
  expect(courseInstance.courseData.courseCode).toBeDefined();
  expect(courseInstance.courseData.department).toBeDefined();
  expect(courseInstance.courseData.name).toBeDefined();
  expect(courseInstance.courseData.evaluationInformation).toBeDefined();
}

describe(
  'Test GET /v1/sisu/instances/:sisuCourseInstanceId - fetch one Sisu intance by Sisu id',
  () => {

    it('should respond with correct data when instance exists', async () => {
      mockedAxios.get.mockResolvedValue({
        data: sisuInstance
      });
      const res: supertest.Response = await request
        .get(`/v1/sisu/instances/${sisuInstance.id}`)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      expect(res.body.success).toBe(true);
      expect(res.body.data.courseInstance).toBeDefined();
      expect(res.body.errors).not.toBeDefined();
      checkRes(res.body.data.courseInstance);
    });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .get('/v1/sisu/courses/ELEC-A7100')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 502 bad gateway, if instance does not exist', async () => {
      mockedAxios.get.mockResolvedValue({
        data: sisuError
      });
      const res: supertest.Response = await request
        .get('/v1/sisu/instances/abc')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadGateway);

      expect(res.body.success).toBe(false);
      expect(res.body.instance).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

  });

describe(
  'Test GET /v1/sisu/courses/:courseCode - fetch all Sisu instance by aalto course code',
  () => {

    it(
      'should respond with correct data when course and at least one active instances exist',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: Array(5).fill(sisuInstance)
        });
        const res: supertest.Response = await request
          .get('/v1/sisu/courses/ELEC-A7100')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.Ok);

        expect(res.body.success).toBe(true);
        expect(res.body.data.courseInstances).toBeDefined();
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.courseInstances.length).toBe(5);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        res.body.data.courseInstances.forEach((courseInstance: any) => checkRes(courseInstance));
      });

    it('should respond with 401 unauthorized, if not logged in', async () => {
      await request
        .get('/v1/sisu/courses/ELEC-A7100')
        .set('Accept', 'application/json')
        .expect(HttpCode.Unauthorized);
    });

    it('should respond with 502 bad gateway, if course does not exist', async () => {
      mockedAxios.get.mockResolvedValue({
        data: sisuError
      });
      const res: supertest.Response = await request
        .get('/v1/sisu/courses/abc')
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadGateway);

      expect(res.body.success).toBe(false);
      expect(res.body.data).not.toBeDefined();
      expect(res.body.errors).toBeDefined();
    });

    it(
      'should respond with 502 bad gateway, if course does not have active instances',
      async () => {
        mockedAxios.get.mockResolvedValue({
          data: sisuError
        });
        const res: supertest.Response = await request
          .get('/v1/sisu/courses/ELEC-A7100')
          .set('Cookie', cookies.adminCookie)
          .set('Accept', 'application/json')
          .expect(HttpCode.BadGateway);

        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors).toBeDefined();
      });

  });
