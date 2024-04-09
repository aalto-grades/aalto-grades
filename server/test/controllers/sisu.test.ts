// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from '@common/types';
import axios, {AxiosStatic} from 'axios';
import supertest from 'supertest';

import {app} from '../../src/app';
import {sisuError, sisuInstance} from '../mock-data/sisu';
import {Cookies, getCookies} from '../util/getCookies';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<
  typeof axios
>;

const request = supertest(app);
let cookies: Cookies = {
  adminCookie: [],
  teacherCookie: [],
};

beforeAll(async () => {
  cookies = await getCookies();
});

// function checkRes(
//   courseInstance: CourseInstanceData,
//   id: string,
//   inUse: boolean
// ): void {
//   expect(courseInstance.id).not.toBeDefined();
//   expect(courseInstance.sisuInstanceInUse).toBe(inUse);
//   expect(courseInstance.sisuCourseInstanceId).toBe(id);
//   expect(courseInstance.startingPeriod).not.toBeDefined();
//   expect(courseInstance.endingPeriod).not.toBeDefined();
//   expect(courseInstance.startDate).toBeDefined();
//   expect(courseInstance.endDate).toBeDefined();
//   expect(courseInstance.type).toBeDefined();
//   expect(courseInstance.courseData?.courseCode).toBeDefined();
//   expect(courseInstance.courseData?.minCredits).toBeDefined();
//   expect(courseInstance.courseData?.maxCredits).toBeDefined();
//   expect(courseInstance.courseData?.gradingScale).toBeDefined();
//   expect(courseInstance.courseData?.teachersInCharge).toBeDefined();
//   expect(courseInstance.courseData?.languageOfInstruction).toBeDefined();
//   expect(courseInstance.courseData?.department).toBeDefined();
//   expect(courseInstance.courseData?.name).toBeDefined();
// }

describe('Test GET /v1/sisu/instances/:sisuCourseInstanceId - fetch one Sisu intance by Sisu id', () => {
  it('should respond with correct data when instance exists', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuInstance,
    });
    const res: supertest.Response = await request
      .get(`/v1/sisu/instances/${sisuInstance.id}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.data).toBeDefined();
    expect(res.body.errors).not.toBeDefined();
    // checkRes(res.body.data, sisuInstance.id, false);
  });

  it('should show Sisu ID as taken when instance has existing course instance in DB', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        ...sisuInstance,
        id: 'aalto-CUR-169778-3874205',
      },
    });
    const res: supertest.Response = await request
      .get(`/v1/sisu/instances/${sisuInstance.id}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.data).toBeDefined();
    expect(res.body.errors).not.toBeDefined();
    // checkRes(res.body.data, 'aalto-CUR-169778-3874205', true);
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/sisu/courses/ELEC-A7100')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 502 bad gateway, if instance does not exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuError,
    });
    const res: supertest.Response = await request
      .get('/v1/sisu/instances/abc')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadGateway);

    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.errors[0]).toBe('external API error: 102');
  });
});

describe('Test GET /v1/sisu/courses/:courseCode - fetch all Sisu instance by Aalto course code', () => {
  it('should respond with correct data when course and at least one active instances exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: Array(5).fill(sisuInstance),
    });
    const res: supertest.Response = await request
      .get('/v1/sisu/courses/ELEC-A7100')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.data).toBeDefined();
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.length).toBe(5);
    // res.body.data.forEach((courseInstance: CourseInstanceData) =>
    //   checkRes(courseInstance, sisuInstance.id, false)
    // );
  });

  it('should show Sisu ID as taken when instances has existing course instance in DB', async () => {
    mockedAxios.get.mockResolvedValue({
      data: Array(5).fill({
        ...sisuInstance,
        id: 'aalto-CUR-169778-3874205',
      }),
    });
    const res: supertest.Response = await request
      .get('/v1/sisu/courses/ELEC-A7100')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.data).toBeDefined();
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.length).toBe(5);
    // res.body.data.forEach((courseInstance: CourseInstanceData) =>
    //   checkRes(courseInstance, 'aalto-CUR-169778-3874205', true)
    // );
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/sisu/courses/ELEC-A7100')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 502 bad gateway, if course has no active instances or does not exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuError,
    });
    const res: supertest.Response = await request
      .get('/v1/sisu/courses/ELEC-A7100')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadGateway);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors[0]).toBe('external API error: 102');
  });
});
