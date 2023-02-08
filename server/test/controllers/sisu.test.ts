// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, { AxiosStatic } from 'axios';
import supertest from 'supertest';

import { sisuInstance, sisuError } from '../mockData/sisuMockData';
import { app } from '../../src/app';

jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test GET /v1/courses/sisu/instance/:instanceId', () => {

  it('should respond with correct data when instance exists', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuInstance
    });
    const res: supertest.Response = await request.get(
      '/v1/courses/sisu/instance/aalto-CUR-163498-3084205'
    );
    expect(res.body.success).toBe(true);
    expect(res.body.instance).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.instance.id).toBe(sisuInstance.id);
    expect(res.body.instance.startingPeriod).toBeDefined();
    expect(res.body.instance.endingPeriod).toBeDefined();
    expect(res.body.instance.minCredits).toBeDefined();
    expect(res.body.instance.maxCredits).toBeDefined();
    expect(res.body.instance.startDate).toBeDefined();
    expect(res.body.instance.endDate).toBeDefined();
    expect(res.body.instance.courseType).toBeDefined();
    expect(res.body.instance.gradingType).toBeDefined();
    expect(res.body.instance.responsibleTeachers).toBeDefined();
    expect(res.body.instance.courseData.courseCode).toBeDefined();
    expect(res.body.instance.courseData.department).toBeDefined();
    expect(res.body.instance.courseData.name).toBeDefined();
    expect(res.body.instance.courseData.evaluationInformation).toBeDefined();
    expect(res.status).toEqual(200);
  });

  it('should respond with error when instance does not exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuError
    });
    const res: supertest.Response = await request.get('/v1/courses/sisu/instance/abc');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.status).toEqual(500);
  });
});

describe('Test GET /v1/courses/sisu/:courseId', () => {

  it('should respond with correct data when course and active instances exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: Array(5).fill(sisuInstance)
    });
    const res: supertest.Response = await request.get('/v1/courses/sisu/ELEC-A7100');
    expect(res.body.success).toBe(true);
    expect(res.body.instances).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.instances.length).toBe(5);
    expect(res.body.instances[0].id).toBe(sisuInstance.id);
    expect(res.body.instances[0].courseData.courseCode).toBeDefined();
    expect(res.body.instances[0].minCredits).toBeDefined();
    expect(res.body.instances[0].maxCredits).toBeDefined();
    expect(res.body.instances[0].courseData.department).toBeDefined();
    expect(res.body.instances[0].courseData.name).toBeDefined();
    expect(res.body.instances[0].courseData.evaluationInformation).toBeDefined();
    expect(res.body.instances[0].startingPeriod).toBeDefined();
    expect(res.body.instances[0].endingPeriod).toBeDefined();
    expect(res.body.instances[0].startDate).toBeDefined();
    expect(res.body.instances[0].endDate).toBeDefined();
    expect(res.body.instances[0].courseType).toBeDefined();
    expect(res.body.instances[0].gradingType).toBeDefined();
    expect(res.body.instances[0].responsibleTeachers).toBeDefined();
    expect(res.status).toEqual(200);
  });

  it('should respond with error when course does not exist', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuError
    });
    const res: supertest.Response = await request.get('/v1/courses/sisu/abc');
    expect(res.body.success).toBe(false);
    expect(res.body.instances).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.status).toEqual(500);
  });

  it('should respond with error when course does not have active instances', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuError
    });
    const res: supertest.Response = await request.get('/v1/courses/sisu/ELEC-A7100');
    expect(res.body.success).toBe(false);
    expect(res.body.instances).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.status).toEqual(500);
  });
});
