// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, { AxiosStatic } from 'axios';
import supertest from 'supertest';

import { app } from '../../src/app';
import { HttpCode } from '../../src/types/httpCode';
import { sisuInstance, sisuError } from '../mockData/sisuMockData';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test GET /v1/sisu/instances/:sisuCourseInstanceId', () => {

  it('should respond with correct data when instance exists', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuInstance
    });
    const res: supertest.Response = await request.get(`/v1/sisu/instances/${sisuInstance.id}`);
    expect(res.body.success).toBe(true);
    expect(res.body.data.courseInstance).toBeDefined();
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.courseInstance.id).toBeDefined();
    expect(res.body.data.courseInstance.sisuCourseInstanceId).toBe(sisuInstance.id);
    expect(res.body.data.courseInstance.startingPeriod).toBeDefined();
    expect(res.body.data.courseInstance.endingPeriod).toBeDefined();
    expect(res.body.data.courseInstance.minCredits).toBeDefined();
    expect(res.body.data.courseInstance.maxCredits).toBeDefined();
    expect(res.body.data.courseInstance.startDate).toBeDefined();
    expect(res.body.data.courseInstance.endDate).toBeDefined();
    expect(res.body.data.courseInstance.courseType).toBeDefined();
    expect(res.body.data.courseInstance.gradingType).toBeDefined();
    expect(res.body.data.courseInstance.responsibleTeachers).toBeDefined();
    expect(res.body.data.courseInstance.courseData.courseCode).toBeDefined();
    expect(res.body.data.courseInstance.courseData.department).toBeDefined();
    expect(res.body.data.courseInstance.courseData.name).toBeDefined();
    expect(res.body.data.courseInstance.courseData.evaluationInformation).toBeDefined();
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
    expect(res.body.data.courseInstances[0].id).toBeDefined();
    expect(res.body.data.courseInstances[0].sisuCourseInstanceId).toBe(sisuInstance.id);
    expect(res.body.data.courseInstances[0].courseData.courseCode).toBeDefined();
    expect(res.body.data.courseInstances[0].minCredits).toBeDefined();
    expect(res.body.data.courseInstances[0].maxCredits).toBeDefined();
    expect(res.body.data.courseInstances[0].courseData.department).toBeDefined();
    expect(res.body.data.courseInstances[0].courseData.name).toBeDefined();
    expect(res.body.data.courseInstances[0].courseData.evaluationInformation).toBeDefined();
    expect(res.body.data.courseInstances[0].startingPeriod).toBeDefined();
    expect(res.body.data.courseInstances[0].endingPeriod).toBeDefined();
    expect(res.body.data.courseInstances[0].startDate).toBeDefined();
    expect(res.body.data.courseInstances[0].endDate).toBeDefined();
    expect(res.body.data.courseInstances[0].courseType).toBeDefined();
    expect(res.body.data.courseInstances[0].gradingType).toBeDefined();
    expect(res.body.data.courseInstances[0].responsibleTeachers).toBeDefined();
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
