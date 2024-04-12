// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Op} from 'sequelize';
import supertest from 'supertest';

import {HttpCode, NewGrade} from '@common/types';
import {app} from '../../src/app';
import * as gradesUtil from '../../src/controllers/utils/grades';
import AttainmentGrade from '../../src/database/models/attainmentGrade';
import User from '../../src/database/models/user';
import {ErrorSchema, ZodErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);
let cookies: Cookies = {
  adminCookie: [],
  teacherCookie: [],
};

const testCourseId = 8;
const testCourse2Id = 9; // Not teacher in charge, final grade not calculated
const badId = 1000000;
const students = [
  {id: 6, studentNumber: '325235'},
  {id: 7, studentNumber: '826139'},
  {id: 8, studentNumber: '849946'},
  {id: 9, studentNumber: '183958'},
  {id: 10, studentNumber: '686426'},
  {id: 11, studentNumber: '753213'},
  {id: 12, studentNumber: '279337'},
  {id: 13, studentNumber: '495298'},
  {id: 14, studentNumber: '638843'},
  {id: 15, studentNumber: '216384'},
];
const studentNumbers = students.map(student => student.studentNumber);

// TODO: Test multiple final grades
// TODO: Test getting grades

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test POST /v1/courses/:courseId/grades/csv/sisu - export Sisu compatible grading in CSV', () => {
  jest
    .spyOn(global.Date, 'now')
    .mockImplementation((): number => new Date('2023-06-21').getTime());

  jest
    .spyOn(gradesUtil, 'getDateOfLatestGrade')
    .mockImplementation(
      (_userId: number, _assessmentmodelId: number): Promise<Date> =>
        Promise.resolve(new Date('2023-06-21'))
    );

  it('should export CSV succesfully when course results are found (admin user)', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades/csv/sisu`)
      .send({studentNumbers})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
325235,2,5,21.6.2023,EN,
826139,3,5,21.6.2023,EN,
849946,2,5,21.6.2023,EN,
183958,0,5,21.6.2023,EN,
686426,0,5,21.6.2023,EN,
753213,3,5,21.6.2023,EN,
279337,5,5,21.6.2023,EN,
495298,5,5,21.6.2023,EN,
638843,3,5,21.6.2023,EN,
216384,2,5,21.6.2023,EN,
`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV succesfully when course results are found (teacher in charge)', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades/csv/sisu`)
      .send({studentNumbers})
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
325235,2,5,21.6.2023,EN,
826139,3,5,21.6.2023,EN,
849946,2,5,21.6.2023,EN,
183958,0,5,21.6.2023,EN,
686426,0,5,21.6.2023,EN,
753213,3,5,21.6.2023,EN,
279337,5,5,21.6.2023,EN,
495298,5,5,21.6.2023,EN,
638843,3,5,21.6.2023,EN,
216384,2,5,21.6.2023,EN,
`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export only selected grades', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades/csv/sisu`)
      .send({studentNumbers: ['183958', '279337', '216384']})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
183958,0,5,21.6.2023,EN,
279337,5,5,21.6.2023,EN,
216384,2,5,21.6.2023,EN,
`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV succesfully with custom assessmentDate and completionLanguage', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades/csv/sisu`)
      .send({
        studentNumbers,
        assessmentDate: new Date(2023, 4, 12),
        completionLanguage: 'JA',
      })
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
325235,2,5,12.5.2023,JA,
826139,3,5,12.5.2023,JA,
849946,2,5,12.5.2023,JA,
183958,0,5,12.5.2023,JA,
686426,0,5,12.5.2023,JA,
753213,3,5,12.5.2023,JA,
279337,5,5,12.5.2023,JA,
495298,5,5,12.5.2023,JA,
638843,3,5,12.5.2023,JA,
216384,2,5,12.5.2023,JA,
`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should respond with 400 bad request, if (optional) completionLanguage param is not valid', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades/csv/sisu`)
      .send({studentNumbers, completionLanguage: 'ja'})
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if (optional) assessmentDate param is not valid date', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades/csv/sisu`)
      .send({studentNumbers, assessmentDate: '2024-12-00T00:00:00.000Z'})
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades/csv/sisu`)
      .send({studentNumbers})
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .post(`/v1/courses/${testCourse2Id}/grades/csv/sisu`)
      .send({studentNumbers: ['325235']})
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if grades have not been calculated yet', async () => {
    const res = await request
      .post(`/v1/courses/${testCourse2Id}/grades/csv/sisu`)
      .send({studentNumbers: ['325235']})
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .post(`/v1/courses/${badId}/grades/csv/sisu`)
      .send({studentNumbers})
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test POST /v1/courses/:courseId/grades - post grades', () => {
  const genGrades = (studentNumber: string): NewGrade[] => [
    {
      studentNumber,
      attainmentId: 32,
      grade: Math.floor(Math.random() * 11),
      date: new Date(),
      expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
      comment: '',
    },
    {
      studentNumber,
      attainmentId: 33,
      grade: Math.floor(Math.random() * 11),
      date: new Date(),
      expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
      comment: '',
    },
    {
      studentNumber,
      attainmentId: 34,
      grade: Math.floor(Math.random() * 11),
      date: new Date(),
      expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
      comment: '',
    },
  ];

  it('should post succesfully when attainments and users exist (admin user)', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send(genGrades('573857'))
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should post succesfully when attainments and users exist (teacher user)', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send(genGrades('169639'))
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should create users when a user does not exist in database', async () => {
    let users = await User.findAll({
      where: {
        studentNumber: {
          [Op.in]: ['987654', '998877'],
        },
      },
    });
    expect(users.length).toBe(0);

    const res = await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send([...genGrades('987654'), ...genGrades('998877')])
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');

    users = await User.findAll({
      where: {
        studentNumber: {
          [Op.in]: ['987654', '998877'],
        },
      },
    });
    expect(users.length).toBe(2);
  });

  it('should mark correct grader ID', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send(genGrades('581953'))
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');

    const userAttainment = await AttainmentGrade.findOne({
      where: {
        userId: 18,
        attainmentId: 32,
      },
    });

    expect(userAttainment?.graderId).toBe(1);
  });

  it('grades should be in the database', async () => {
    const data = genGrades('156214');
    await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send(data)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const attainmentGrade = await AttainmentGrade.findOne({
      where: {
        userId: 19,
        attainmentId: 32,
      },
    });
    expect(attainmentGrade?.grade).toEqual(data[0].grade);
    expect(attainmentGrade?.userId).toEqual(19);
    expect(attainmentGrade?.attainmentId).toEqual(32);
  });

  it('should allow uploading multiple grades to the same attainment for a student', async () => {
    const data1 = genGrades('519334');
    const data2 = genGrades('519334');
    const upload = async (i: number): Promise<void> => {
      const res = await request
        .post(`/v1/courses/${testCourseId}/grades`)
        .send(i === 1 ? data1 : data2)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
    };

    await upload(1);
    let grades = await AttainmentGrade.findAll({
      where: {userId: 20, attainmentId: 32},
    });
    expect(grades.length).toEqual(1);
    expect(grades[0].grade).toEqual(data1[0].grade);

    await upload(2);
    grades = await AttainmentGrade.findAll({
      where: {userId: 20, attainmentId: 32},
    });
    expect(grades.length).toEqual(2);
    expect(grades.find(val => val.grade === data1[0].grade)).toBeDefined();
    expect(grades.find(val => val.grade === data2[0].grade)).toBeDefined();
  });

  it('should process big json succesfully (5 000 x 3 x 2 = 90 000 individual attainment grades)', async () => {
    const data: NewGrade[] = [];
    for (let i = 10000; i < 15000; i++) {
      for (let j = 0; j < 2; j++) {
        const newData = genGrades(i.toString());
        data.push(newData[0]);
        data.push(newData[1]);
        data.push(newData[2]);
      }
    }
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send(data)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
  }, 50000);

  it('should respond with 400 bad request, if the CSV has grades with incorrect type', async () => {
    const data = genGrades('118345')[0] as {grade: number | string};
    data.grade = 'test';

    const res = await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send(data)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if the expiry date is before completion date', async () => {
    const data = genGrades('118345')[0];
    data.date = new Date(new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000);

    const res = await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send(data)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseId}/grades`)
      .send(genGrades('118345'))
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .post(`/v1/courses/${testCourse2Id}/grades`)
      .send(genGrades('118345'))
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .post(`/v1/courses/${badId}/grades`)
      .send(genGrades('118345'))
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test PUT /v1/courses/:courseId/assessment-models/:assessmentModelId/grades/:gradeId - edit user grade data', () => {
  it('should edit user attainment grade data (admin user)', async () => {
    const res = await request
      .put(`/v1/courses/${testCourseId}/assessment-models/7/grades/4`)
      .send({
        grade: 5,
        date: new Date(),
        comment: 'testing',
      })
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should edit user attainment grade data (teacher in charge)', async () => {
    const res = await request
      .put(`/v1/courses/${testCourseId}/assessment-models/7/grades/5`)
      .send({
        grade: 5,
        date: new Date(),
        comment: 'testing',
      })
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .put('/v1/courses/1/assessment-models/1/grades/1')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .put(`/v1/courses/${testCourse2Id}/assessment-models/8/grades/4`)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if grade does not exist', async () => {
    const res = await request
      .put(`/v1/courses/${testCourseId}/assessment-models/7/grades/${badId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if assessment model does not exist', async () => {
    const res = await request
      .put(`/v1/courses/${testCourseId}/assessment-models/${badId}/grades/4`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .put(`/v1/courses/${badId}/assessment-models/7/grades/4`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 409 conflict, if assessment model does not belong to the course', async () => {
    const res = await request
      .put(`/v1/courses/${testCourseId}/assessment-models/1/grades/4`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Conflict);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});
