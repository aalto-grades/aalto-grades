// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {AttainmentData, HttpCode, NewGrade} from '@common/types';
import {app} from '../../src/app';
import * as gradesUtil from '../../src/controllers/utils/grades';
import AttainmentGrade from '../../src/database/models/attainmentGrade';
import User from '../../src/database/models/user';
import {courseCreator} from '../util/course';
import {cleanDb, setupDb} from '../util/dbReset';
import {ErrorSchema, TEACHER_ID, ZodErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let courseAttainments: AttainmentData[] = [];
let editGradeId = -1;
let noRoleCourseId = -1;
let noRoleGradeId = -1;
const nonExistentId = 1000000;

const students = [
  {id: 8, studentNumber: '325235', finalGrade: 2},
  {id: 9, studentNumber: '826139', finalGrade: 3},
  {id: 10, studentNumber: '849946', finalGrade: 2},
  {id: 11, studentNumber: '183958', finalGrade: 0},
  {id: 12, studentNumber: '686426', finalGrade: 0},
  {id: 13, studentNumber: '753213', finalGrade: 3},
  {id: 14, studentNumber: '279337', finalGrade: 5},
  {id: 15, studentNumber: '495298', finalGrade: 5},
  {id: 16, studentNumber: '638843', finalGrade: 3},
  {id: 17, studentNumber: '216384', finalGrade: 2},
];
const students2 = [
  {id: 18, studentNumber: '573857'},
  {id: 19, studentNumber: '169639'},
  {id: 20, studentNumber: '581953'},
  {id: 21, studentNumber: '156214'},
  {id: 22, studentNumber: '519334'},
  {id: 23, studentNumber: '112239'},
];
const newStudentNumber = '867493';
const studentNumbers = students.map(student => student.studentNumber);

beforeAll(async () => {
  await setupDb();
  cookies = await getCookies();

  let assessmentModelId;
  [courseId, courseAttainments, assessmentModelId] =
    await courseCreator.createCourse({
      courseData: {maxCredits: 5, courseCode: 'CS-A????'},
    });
  for (const student of students) {
    await courseCreator.createFinalGrade(
      courseId,
      student.id,
      assessmentModelId,
      TEACHER_ID,
      student.finalGrade
    );
  }
  editGradeId = await courseCreator.createGrade(
    students[0].id,
    courseAttainments[0].id,
    TEACHER_ID
  );

  let noRoleAttainments;
  [noRoleCourseId, noRoleAttainments] = await courseCreator.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  noRoleGradeId = await courseCreator.createGrade(
    students[0].id,
    noRoleAttainments[0].id,
    TEACHER_ID
  );
});

afterAll(async () => {
  await cleanDb();
});

// TODO: Test multiple final grades
// TODO: Test getting grades
// TODO: Test grades/attainments not belonging to course
// TODO: Test deleting grades

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
      .post(`/v1/courses/${courseId}/grades/csv/sisu`)
      .send({studentNumbers})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
325235,2,5,21.6.2023,en,
826139,3,5,21.6.2023,en,
849946,2,5,21.6.2023,en,
183958,0,5,21.6.2023,en,
686426,0,5,21.6.2023,en,
753213,3,5,21.6.2023,en,
279337,5,5,21.6.2023,en,
495298,5,5,21.6.2023,en,
638843,3,5,21.6.2023,en,
216384,2,5,21.6.2023,en,
`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV succesfully when course results are found (teacher in charge)', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades/csv/sisu`)
      .send({studentNumbers})
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
325235,2,5,21.6.2023,en,
826139,3,5,21.6.2023,en,
849946,2,5,21.6.2023,en,
183958,0,5,21.6.2023,en,
686426,0,5,21.6.2023,en,
753213,3,5,21.6.2023,en,
279337,5,5,21.6.2023,en,
495298,5,5,21.6.2023,en,
638843,3,5,21.6.2023,en,
216384,2,5,21.6.2023,en,
`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export only selected grades', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades/csv/sisu`)
      .send({studentNumbers: ['183958', '279337', '216384']})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
183958,0,5,21.6.2023,en,
279337,5,5,21.6.2023,en,
216384,2,5,21.6.2023,en,
`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV succesfully with custom assessmentDate and completionLanguage', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades/csv/sisu`)
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
325235,2,5,12.5.2023,ja,
826139,3,5,12.5.2023,ja,
849946,2,5,12.5.2023,ja,
183958,0,5,12.5.2023,ja,
686426,0,5,12.5.2023,ja,
753213,3,5,12.5.2023,ja,
279337,5,5,12.5.2023,ja,
495298,5,5,12.5.2023,ja,
638843,3,5,12.5.2023,ja,
216384,2,5,12.5.2023,ja,
`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should respond with 400 bad request, if (optional) completionLanguage param is not valid', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades/csv/sisu`)
      .send({studentNumbers, completionLanguage: 'ja'})
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if (optional) assessmentDate param is not valid date', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades/csv/sisu`)
      .send({studentNumbers, assessmentDate: '2024-12-00T00:00:00.000Z'})
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades/csv/sisu`)
      .send({studentNumbers})
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .post(`/v1/courses/${noRoleCourseId}/grades/csv/sisu`)
      .send({studentNumbers: ['325235']})
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if grades have not been calculated yet', async () => {
    const res = await request
      .post(`/v1/courses/${noRoleCourseId}/grades/csv/sisu`)
      .send({studentNumbers: ['325235']})
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .post(`/v1/courses/${nonExistentId}/grades/csv/sisu`)
      .send({studentNumbers})
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test POST /v1/courses/:courseId/grades - post grades', () => {
  const genGrades = (student: {studentNumber: string}): NewGrade[] => [
    {
      studentNumber: student.studentNumber,
      attainmentId: courseAttainments[0].id,
      grade: Math.floor(Math.random() * 11),
      date: new Date(),
      expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
      comment: '',
    },
    {
      studentNumber: student.studentNumber,
      attainmentId: courseAttainments[1].id,
      grade: Math.floor(Math.random() * 11),
      date: new Date(),
      expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
      comment: '',
    },
    {
      studentNumber: student.studentNumber,
      attainmentId: courseAttainments[2].id,
      grade: Math.floor(Math.random() * 11),
      date: new Date(),
      expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
      comment: '',
    },
  ];

  it('should post succesfully when attainments and users exist (admin user)', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(genGrades(students2[0]))
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should post succesfully when attainments and users exist (teacher user)', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(genGrades(students2[1]))
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should create users when a user does not exist in database', async () => {
    let users = await User.findAll({
      where: {studentNumber: newStudentNumber},
    });
    expect(users.length).toBe(0);

    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(genGrades({studentNumber: newStudentNumber}))
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');

    users = await User.findAll({
      where: {studentNumber: newStudentNumber},
    });
    expect(users.length).toBe(1);
  });

  it('should mark correct grader ID', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(genGrades(students2[2]))
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');

    const userAttainment = await AttainmentGrade.findOne({
      where: {
        userId: students2[2].id,
        attainmentId: courseAttainments[0].id,
      },
    });

    expect(userAttainment?.graderId).toBe(1);
  });

  it('grades should be in the database', async () => {
    const data = genGrades(students2[3]);
    await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(data)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const attainmentGrade = await AttainmentGrade.findOne({
      where: {
        userId: students2[3].id,
        attainmentId: courseAttainments[0].id,
      },
    });
    expect(attainmentGrade?.grade).toEqual(data[0].grade);
    expect(attainmentGrade?.userId).toEqual(students2[3].id);
    expect(attainmentGrade?.attainmentId).toEqual(courseAttainments[0].id);
  });

  it('should allow uploading multiple grades to the same attainment for a student', async () => {
    const data1 = genGrades(students2[4]);
    const data2 = genGrades(students2[4]);
    const upload = async (i: number): Promise<void> => {
      const res = await request
        .post(`/v1/courses/${courseId}/grades`)
        .send(i === 1 ? data1 : data2)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
    };

    await upload(1);
    let grades = await AttainmentGrade.findAll({
      where: {userId: students2[4].id, attainmentId: courseAttainments[0].id},
    });
    expect(grades.length).toEqual(1);
    expect(grades[0].grade).toEqual(data1[0].grade);

    await upload(2);
    grades = await AttainmentGrade.findAll({
      where: {userId: students2[4].id, attainmentId: courseAttainments[0].id},
    });
    expect(grades.length).toEqual(2);
    expect(grades.find(val => val.grade === data1[0].grade)).toBeDefined();
    expect(grades.find(val => val.grade === data2[0].grade)).toBeDefined();
  });

  it('should process big json succesfully (5 000 x 3 x 2 = 90 000 individual attainment grades)', async () => {
    const data: NewGrade[] = [];
    for (let i = 10000; i < 15000; i++) {
      for (let j = 0; j < 2; j++) {
        const newData = genGrades({studentNumber: i.toString()});
        data.push(newData[0]);
        data.push(newData[1]);
        data.push(newData[2]);
      }
    }
    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(data)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
  }, 50000);

  it('should respond with 400 bad request, if the CSV has grades with incorrect type', async () => {
    const data = genGrades(students2[5])[0] as {grade: number | string};
    data.grade = 'test';

    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(data)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if the expiry date is before completion date', async () => {
    const data = genGrades(students2[5])[0];
    data.date = new Date(new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000);

    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send([data])
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(genGrades(students2[5]))
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .post(`/v1/courses/${noRoleCourseId}/grades`)
      .send(genGrades(students2[5]))
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .post(`/v1/courses/${nonExistentId}/grades`)
      .send(genGrades(students2[5]))
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test PUT /v1/courses/:courseId/grades/:gradeId - edit user grade data', () => {
  it('should edit user attainment grade data (admin user)', async () => {
    const res = await request
      .put(`/v1/courses/${courseId}/grades/${editGradeId}`)
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
      .put(`/v1/courses/${courseId}/grades/${editGradeId}`)
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
      .put(`/v1/courses/${courseId}/grades/${editGradeId}`)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .put(`/v1/courses/${noRoleCourseId}/grades/${noRoleGradeId}`)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if grade does not exist', async () => {
    const res = await request
      .put(`/v1/courses/${courseId}/grades/${nonExistentId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .put(`/v1/courses/${nonExistentId}/grades/${editGradeId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});
