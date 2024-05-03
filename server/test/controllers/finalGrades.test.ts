// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {FinalGradeDataSchema, HttpCode, NewFinalGrade} from '@common/types';
import {app} from '../../src/app';
import FinalGrade from '../../src/database/models/finalGrade';
import {courseCreator} from '../util/course';
import {cleanDb, setupDb} from '../util/dbReset';
import {ErrorSchema, TEACHER_ID} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let editCourseId = -1;
let noRoleCourseId = -1;
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

beforeAll(async () => {
  await setupDb();
  cookies = await getCookies();

  let assessmentModelId;
  let _; // To be able to use spread
  [courseId, _, assessmentModelId] = await courseCreator.createCourse({});
  for (const student of students) {
    await courseCreator.createFinalGrade(
      courseId,
      student.id,
      assessmentModelId,
      TEACHER_ID
    );
  }

  [editCourseId] = await courseCreator.createCourse({});

  [noRoleCourseId] = await courseCreator.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
});

afterAll(async () => {
  await cleanDb();
});

// TODO: Test multiple final grades

/**
 * Check that the expected number of grades exist for a user for a specific
 * attainment, including checking the numeric values of those grades.
 */
const checkGradeAmount = async (
  student: {id: number},
  expectedGrades: number[]
): Promise<void> => {
  const dbAttainmentGrades = await FinalGrade.findAll({
    where: {userId: student.id, courseId: editCourseId},
  });

  const dbGrades = dbAttainmentGrades.map(
    attainmentGrade => attainmentGrade.grade
  );
  expect(dbGrades).toEqual(expectedGrades);
};

describe('Test GET /v1/courses/:courseId/finalGrades - get final grades', () => {
  it('should get final grades succesfully when course results are found (admin user)', async () => {
    const res = await request
      .get(`/v1/courses/${courseId}/finalGrades`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(FinalGradeDataSchema.strict()).nonempty();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should get final grades succesfully when course results are found (teacher in charge)', async () => {
    const res = await request
      .get(`/v1/courses/${courseId}/finalGrades`)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(FinalGradeDataSchema.strict()).nonempty();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if course ID is invalid', async () => {
    const res = await request
      .get('/v1/courses/bad/finalGrades')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .get(`/v1/courses/${courseId}/finalGrades`)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .get(`/v1/courses/${noRoleCourseId}/finalGrades`)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .get(`/v1/courses/${nonExistentId}/finalGrades`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test POST /v1/courses/:courseId/finalGrades - add final grades', () => {
  const getData = (student: {
    id: number;
    finalGrade: number;
  }): NewFinalGrade => ({
    userId: student.id,
    assessmentModelId: 9,
    grade: student.finalGrade,
    date: new Date(),
  });
  const checkGrade = async (student: {
    id: number;
    finalGrade: number;
  }): Promise<void> => {
    const result = await FinalGrade.findOne({
      where: {userId: student.id, courseId: editCourseId},
    });

    expect(result).not.toBe(null);
    expect(result?.grade).toBe(student.finalGrade);
  };

  it('should add a grade (admin user)', async () => {
    const res = await request
      .post(`/v1/courses/${editCourseId}/finalGrades`)
      .send([getData(students[0])])
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGrade(students[0]);
  });

  it('should add a grade (teacher in charge)', async () => {
    const res = await request
      .post(`/v1/courses/${editCourseId}/finalGrades`)
      .send([getData(students[1])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGrade(students[1]);
  });

  it('should add multiple correct grades based on student numbers', async () => {
    const res = await request
      .post(`/v1/courses/${editCourseId}/finalGrades`)
      .send([getData(students[2]), getData(students[3])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGrade(students[2]);
    await checkGrade(students[3]);
  });

  it('should add multiple grades for the same final grade on repeated runs', async () => {
    await checkGradeAmount(students[4], []);

    const res = await request
      .post(`/v1/courses/${editCourseId}/finalGrades`)
      .send([getData(students[4])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGradeAmount(students[4], [students[4].finalGrade]);

    const res2 = await request
      .post(`/v1/courses/${editCourseId}/finalGrades`)
      .send([getData(students[4])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res2.body)).toBe('{}');
    await checkGradeAmount(students[4], [
      students[4].finalGrade,
      students[4].finalGrade,
    ]);
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .post(`/v1/courses/${editCourseId}/finalGrades`)
      .send([getData(students[4])])
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .post(`/v1/courses/${noRoleCourseId}/finalGrades`)
      .send([getData(students[4])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});
