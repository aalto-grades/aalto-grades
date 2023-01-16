// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from '../../src/app';
import { TeacherCourseData } from '../../src/controllers/user';
import supertest from 'supertest';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

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
    expect(res.body.course.minCredits).toBeDefined();
    expect(res.body.course.maxCredits).toBeDefined();
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
});

describe('Test GET /v1/courses/:courseId/instances/:instanceId', () => {
  it('should respond with correct data when course instance exists', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1/instances/1');
    expect(res.body.success).toBe(true);
    expect(res.body.instance).toBeDefined();
    expect(res.body.error).not.toBeDefined();
    expect(res.body.instance.id).toBe(1);
    expect(res.body.instance.courseCode).toBeDefined();
    expect(res.body.instance.minCredits).toBeDefined();
    expect(res.body.instance.maxCredits).toBeDefined();
    expect(res.body.instance.startingPeriod).toBeDefined();
    expect(res.body.instance.endingPeriod).toBeDefined();
    expect(res.body.instance.startDate).toBeDefined();
    expect(res.body.instance.endDate).toBeDefined();
    expect(res.body.instance.courseType).toBeDefined();
    expect(res.body.instance.gradingType).toBeDefined();
    expect(res.body.instance.responsibleTeacher).toBeDefined();
    expect(res.body.instance.department).toBeDefined();
    expect(res.body.instance.name).toBeDefined();
    expect(res.body.instance.evaluationInformation).toBeDefined();
    expect(res.statusCode).toBe(200);
  });

  it('should respond with 404 not found, if non-existing course instance id', async () => {
    const res: supertest.Response = await request.get('/v1/courses/1/instances/-1');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);
  });

  it('should respond with 404 not found, if non-existing course id', async () => {
    const res: supertest.Response = await request.get('/v1/courses/-1/instances/1');
    expect(res.body.success).toBe(false);
    expect(res.body.instance).not.toBeDefined();
    expect(res.body.error).toBeDefined();
    expect(res.statusCode).toBe(404);

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
