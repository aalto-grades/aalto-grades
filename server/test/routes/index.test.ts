// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from '../../src/app';
import { sisuInstance, sisuError } from '../mockData/sisuMockData';
import { TeacherCourseData } from '../../src/controllers/user';
import supertest from 'supertest';
import axios, { AxiosStatic } from 'axios';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
jest.mock('axios');
const mockedAxios: jest.Mocked<AxiosStatic> = axios as jest.Mocked<typeof axios>;

describe('Test GET /v1/user/:userId/courses', () => {
  jest
    .spyOn(global.Date, 'now')
    .mockImplementation((): number => {
      return new Date('2022-12-10').valueOf();
    });

  it('should respond with correct data', async () => {
    const res: supertest.Response = await request.get('/v1/user/1/courses');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);

    expect(res.body.courses).toStrictEqual({
      'current': [],
      'previous': [
        {
          'id': 1,
          'courseCode': 'CS-A1110',
          'minCredits': 5,
          'maxCredits': 5,
          'department': {
            'fi': 'Tietotekniikan laitos',
            'sv': 'Institutionen för datateknik',
            'en': 'Department of Computer Science'
          },
          'name': {
            'fi': 'Ohjelmointi 1',
            'sv': 'Programmering 1',
            'en': 'Programming 1'
          },
          'evaluationInformation': {
            'fi': '',
            'sv': '',
            'en': ''
          }
        }
      ]
    });
  });

  it('should not contain duplicate courses', async () => {
    const res: supertest.Response = await request.get('/v1/user/2/courses');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);

    const courses: TeacherCourseData = res.body.courses as TeacherCourseData;
    let n: number = 0;
    for (const i in courses.current) {
      if (courses.current[i].courseCode === 'CS-A1120')
        n++;
    }

    expect(n).toBe(1);
  });

  it('should correctly identify whether a course is current or previous', async () => {
    const res: supertest.Response = await request.get('/v1/user/3/courses');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);

    const courses: TeacherCourseData = res.body.courses as TeacherCourseData;
    expect(courses.current.length).toBe(1);
    expect(courses.current[0].courseCode).toBe('PHYS-A1130');
    expect(courses.previous.length).toBe(1);
    expect(courses.previous[0].courseCode).toBe('TU-A1100');
  });
});

describe('Test GET /v1/courses/:courseId/instances', () => {

  it('should respond with correct data', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1/instances');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);

    expect(res.body).toStrictEqual({
      'success':true,
      'instances':[
        {
          'courseId':1,
          'gradingType':'NUMERICAL',
          'startingPeriod':'I',
          'endingPeriod':'II'
        },
        {
          'courseId':1,
          'gradingType':'PASSFAIL',
          'startingPeriod':'I',
          'endingPeriod':'II'
        },
        {
          'courseId':1,
          'gradingType':'PASSFAIL',
          'startingPeriod':'I',
          'endingPeriod':'II'
        },
        {
          'courseId':1,
          'gradingType':'NUMERICAL',
          'startingPeriod':'III',
          'endingPeriod':'V'
        },
        {
          'courseId':1,
          'gradingType':'PASSFAIL',
          'startingPeriod':'I',
          'endingPeriod':'II'
        },
        {
          'courseId':1,
          'gradingType':'PASSFAIL',
          'startingPeriod':'V',
          'endingPeriod':'V'
        }
      ]});
  });

  it('should respond with error if course does not exist', async () => {
    const res: supertest.Response = await request.get('/v1/courses/-1/instances');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('course with id');
  });

  it('should respond with validation error if courseId is not a number', async () => {
    const res: supertest.Response = await request.get('/v1/courses/a/instances');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('id must be a `number` type');
  });

});

describe('Test GET /v1/courses/sisu/instance/:instanceId', () => {

  it('should respond with correct data when instance exists', async () => {
    mockedAxios.get.mockResolvedValue({
      data: sisuInstance
    });
    const res: supertest.Response = await request.get('/v1/courses/sisu/instance/aalto-CUR-163498-3084205');
    expect(res.body.success).toBe(true);
    expect(res.body.instance).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.instance.id).toBe(sisuInstance.id);
    expect(res.body.instance.startingPeriod).toBeDefined();
    expect(res.body.instance.endingPeriod).toBeDefined();
    expect(res.body.instance.startDate).toBeDefined();
    expect(res.body.instance.endDate).toBeDefined();
    expect(res.body.instance.courseType).toBeDefined();
    expect(res.body.instance.gradingType).toBeDefined();
    expect(res.body.instance.responsibleTeachers).toBeDefined();
    expect(res.body.instance.courseData.courseCode).toBeDefined();
    expect(res.body.instance.courseData.minCredits).toBeDefined();
    expect(res.body.instance.courseData.maxCredits).toBeDefined();
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
    expect(res.body.instances[0].courseData.minCredits).toBeDefined();
    expect(res.body.instances[0].courseData.maxCredits).toBeDefined();
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
