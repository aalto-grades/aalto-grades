// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, { AxiosStatic } from 'axios';
import supertest from 'supertest';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { sisuInstance, sisuError } from '../mockData/sisu';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const request: supertest.SuperTest<supertest.Test> = supertest(app);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkRes(courseInstance: any): void {
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

describe('Test GET /v1/sisu/instances/:sisuCourseInstanceId', () => {

  it('should respond with correct data when instance exists', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuInstance
    });
    const res: supertest.Response = await request.get(`/v1/sisu/instances/${sisuInstance.id}`);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseInstance).toBeDefined();
    expect(res.body.errors).not.toBeDefined();
    checkRes(res.body.data.courseInstance);
    expect(res.status).toEqual(HttpCode.Ok);
  });

  it('should respond with error when instance does not exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuError
    });
    const res: supertest.Response = await request.get('/v1/sisu/instances/abc');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
    expect(res.status).toEqual(HttpCode.BadGateway);
  });
});

describe('Test GET /v1/sisu/courses/:courseCode', () => {

  it('should respond with correct data when course and at least one active' +
    'instances exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: Array(5).fill(sisuInstance)
    });
    const res: supertest.Response = await request.get('/v1/sisu/courses/ELEC-A7100');
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseInstances).toBeDefined();
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.courseInstances.length).toBe(5);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.body.data.courseInstances.forEach((courseInstance: any) => checkRes(courseInstance));
    expect(res.status).toEqual(HttpCode.Ok);
  });

  it('should respond with error when course does not exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuError
    });
    const res: supertest.Response = await request.get('/v1/sisu/courses/abc');
    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
    expect(res.status).toEqual(HttpCode.BadGateway);
  });

  it('should respond with error when course does not have active instances', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuError
    });
    const res: supertest.Response = await request.get('/v1/sisu/courses/ELEC-A7100');
    expect(res.body.success).toBe(false);
    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
    expect(res.status).toEqual(HttpCode.BadGateway);
  });
});
