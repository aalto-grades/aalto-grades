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

describe('Test GET /', () => {
  it('should respond "Hello /" with status code 200', async () => {
    const res: supertest.Response = await request.get('/');
    expect(res.text).toBe('Hello /');
    expect(res.statusCode).toBe(200);
  });
});

describe('Test GET /v1/courses/:courseId', () => {
  it('should respond with correct data when course exists', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1');
    expect(res.body.success).toBe(true);
    expect(res.body.course).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.course.id).toBe(1);
    expect(res.body.course.courseCode).toBeDefined();
    expect(res.body.course.department).toBeDefined();
    expect(res.body.course.name).toBeDefined();
    expect(res.body.course.evaluationInformation).toBeDefined();
    expect(res.statusCode).toBe(200);
  });

  it('should respond with 404 not found, if non-existing course id', async () => {
    const res: supertest.Response = await request.get('/v1/courses/-1');
    expect(res.body.success).toBe(false);
    expect(res.body.course).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);
  });

  it('should respond with 400 bad request, if validation fails (non-number course id)', async () => {
    const res: supertest.Response = await request.get('/v1/courses/abc');
    expect(res.body.success).toBe(false);
    expect(res.body.course).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(400);
  });
});

describe('Test GET /v1/instances/:instanceId', () => {
  it('should respond with correct data when course instance exists', async () => {
    const res: supertest.Response = await request.get('/v1/instances/1');
    expect(res.body.success).toBe(true);
    expect(res.body.instance).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.instance.id).toBe(1);
    expect(res.body.instance.startingPeriod).toBeDefined();
    expect(res.body.instance.endingPeriod).toBeDefined();
    expect(res.body.instance.minCredits).toBeDefined();
    expect(res.body.instance.maxCredits).toBeDefined();
    expect(res.body.instance.startDate).toBeDefined();
    expect(res.body.instance.endDate).toBeDefined();
    expect(res.body.instance.courseType).toBeDefined();
    expect(res.body.instance.gradingType).toBeDefined();
    expect(res.body.instance.responsibleTeacher).toBeDefined();
    expect(res.body.instance.courseData.courseCode).toBeDefined();
    expect(res.body.instance.courseData.department).toBeDefined();
    expect(res.body.instance.courseData.name).toBeDefined();
    expect(res.body.instance.courseData.evaluationInformation).toBeDefined();
    expect(res.statusCode).toBe(200);
  });

  it('should respond with 404 not found, if non-existing course instance id', async () => {
    const res: supertest.Response = await request.get('/v1/instances/-1');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);
  });

  it('should respond with 400 bad request, if validation fails (non-number instance id)', async () => {
    const res: supertest.Response = await request.get('/v1/instances/abc');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(400);
  });
});

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

describe('Test POST /v1/courses', () => {

  it('should respond with course data on correct input', async () => {
    let input: object = {
      courseCode: 'ELEC-A7200',
      department: {
        fi: 'Sähkötekniikan korkeakoulu',
        en: 'School of Electrical Engineering',
        sv: 'Högskolan för elektroteknik'
      },
      name: {
        fi: 'Signaalit ja järjestelmät',
        en: 'Signals and Systems',
        sv: ''
      }
    };
    let res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.course.courseCode).toBe('ELEC-A7200');
    expect(res.body.course.name).toStrictEqual({
      'fi': 'Signaalit ja järjestelmät',
      'en': 'Signals and Systems',
      'sv': ''
    });
    expect(res.body.course.department).toStrictEqual({
      'fi': 'Sähkötekniikan korkeakoulu',
      'en': 'School of Electrical Engineering',
      'sv': 'Högskolan för elektroteknik'
    });

    input = {
      courseCode: 'ELEC-A7200',
      department: {
        fi: 'Sähkötekniikan korkeakoulu',
        en: 'School of Electrical Engineering',
      },
      name: {
        fi: 'Signaalit ja järjestelmät',
        en: 'Signals and Systems',
      }
    };
    res = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.course.courseCode).toBe('ELEC-A7200');
    expect(res.body.course.name).toStrictEqual({
      'fi': 'Signaalit ja järjestelmät',
      'en': 'Signals and Systems',
      'sv': ''
    });
    expect(res.body.course.department).toStrictEqual({
      'fi': 'Sähkötekniikan korkeakoulu',
      'en': 'School of Electrical Engineering',
      'sv': ''
    });
  });

  it('should respond with validation errors, if required fields are undefined', async () => {
    const input: object = {};
    const res: supertest.Response = await request.post('/v1/courses').send(input);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('courseCode is a required field');
    expect(res.body.errors).toContain('department is a required field');
    expect(res.body.errors).toContain('name is a required field');
  });

  /* TODO: move next test case elsewhere in future, after refactoring commonly
   * reusable functionality (e.g. middleware) to their own modules / functions
   */

  it('should respond with syntax error, if parsing request JSON fails', async() => {
    const input: string = '{"courseCode": "ELEC-A7200"';
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send(input)
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toContain('SyntaxError: Unexpected end of JSON input: {"courseCode": "ELEC-A7200"');
  });
});

describe('Test POST /v1/courses/:courseId/instances', () => {
  it('should return success with correct input', async () => {
    async function goodInput(input: object): Promise<void> {
      const res: supertest.Response =
        await request
          .post('/v1/courses/1/instances')
          .send(input);

      expect(res.body.success).toBe(true);
      expect(res.body.instance).toBeDefined();
      expect(res.body.instance.id).toBeDefined();
      expect(res.statusCode).toBe(200);
    }

    await goodInput({
      gradingType: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await goodInput({
      gradingType: 'PASSFAIL',
      startingPeriod: 'III',
      endingPeriod: 'V',
      teachingMethod: 'EXAM',
      responsibleTeacher: 2,
      minCredits: 3,
      maxCredits: 5,
      startDate: '2023-1-19',
      endDate: '2024-4-8'
    });

    await goodInput({
      gradingType: 'PASSFAIL',
      startingPeriod: 'III',
      endingPeriod: 'V',
      teachingMethod: 'EXAM',
      responsibleTeacher: 2,
      minCredits: 0,
      maxCredits: 1,
      startDate: '2023-1-19',
      endDate: '2024-4-8'
    });
  });

  it('should return fail with incorrect input', async () => {
    async function badInput(input: object): Promise<void> {
      const res: supertest.Response =
        await request
          .post('/v1/courses/1/instances')
          .send(input);

      expect(res.body.success).toBe(false);
      expect(res.statusCode).toBe(400);
    }

    await badInput({
      foo: 'bar'
    });

    await badInput({
      gradingType: 'Wrong enum',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingType: 'PASSFAIL',
      startingPeriod: {
        junk: 'data'
      },
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingType: 'PASSFAIL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 42,
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingType: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 5,
      startDate: 'not a date',
      endDate: 'not a date either'
    });

    await badInput({
      gradingType: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: 5,
      maxCredits: 3,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

    await badInput({
      gradingType: 'NUMERICAL',
      startingPeriod: 'I',
      endingPeriod: 'II',
      teachingMethod: 'LECTURE',
      responsibleTeacher: 1,
      minCredits: -1,
      maxCredits: 3,
      startDate: '2022-7-10',
      endDate: '2022-11-10'
    });

  });

  it('should return fail with nonexistent course ID', async () => {
    const res: supertest.Response =
      await request
        .post('/v1/courses/-1/instances')
        .send({
          gradingType: 'NUMERICAL',
          startingPeriod: 'I',
          endingPeriod: 'II',
          teachingMethod: 'LECTURE',
          responsibleTeacher: 1,
          minCredits: 5,
          maxCredits: 5,
          startDate: '2022-7-10',
          endDate: '2022-11-10'
        });

    expect(res.body.success).toBe(false);
    expect(res.statusCode).toBe(401);
  });

  it('should return fail with nonexistent responsible teacher', async () => {
    const res: supertest.Response =
      await request
        .post('/v1/courses/1/instances')
        .send({
          gradingType: 'NUMERICAL',
          startingPeriod: 'I',
          endingPeriod: 'II',
          teachingMethod: 'LECTURE',
          responsibleTeacher: -1,
          minCredits: 5,
          maxCredits: 5,
          startDate: '2022-7-10',
          endDate: '2022-11-10'
        });

    expect(res.body.success).toBe(false);
    expect(res.statusCode).toBe(401);
  });
});

describe('Test GET /v1/courses/:courseId/instances', () => {

  it('should respond with correct data', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1/instances');
    expect(res.body.success).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.body.instances[0].courseData.id).toBeDefined();
    expect(res.body.instances[0].courseData.courseCode).toBeDefined();
    expect(res.body.instances[0].id).toBeDefined();
    expect(res.body.instances[0].startingPeriod).toBeDefined();
    expect(res.body.instances[0].endingPeriod).toBeDefined();
    expect(res.body.instances[0].minCredits).toBeDefined();
    expect(res.body.instances[0].maxCredits).toBeDefined();
    expect(res.body.instances[0].startDate).toBeDefined();
    expect(res.body.instances[0].endDate).toBeDefined();
    expect(res.body.instances[0].courseType).toBeDefined();
    expect(res.body.instances[0].gradingType).toBeDefined();
    expect(res.body.instances[0].responsibleTeachers).toBeDefined();
  });

  it('should respond with error if course does not exist', async () => {
    const res: supertest.Response = await request.get('/v1/courses/-1/instances');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should respond with error if courseId is not a number', async () => {
    const res: supertest.Response = await request.get('/v1/courses/a/instances');
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
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
