// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {FinalGradeDataSchema, HttpCode, NewFinalGrade} from '@common/types';
import {app} from '../../src/app';
import FinalGrade from '../../src/database/models/finalGrade';
import TeacherInCharge from '../../src/database/models/teacherInCharge';
import {ErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);
let cookies: Cookies = {
  adminCookie: [],
  teacherCookie: [],
};

const testCourseId = 8;
const testCourse2Id = 9; // Not teacher in charge, final grade not calculated
const testCourseAddId = 10;
const badId = 1000000;
const students = [
  {id: 6, studentNumber: '325235', finalGrade: 2},
  {id: 7, studentNumber: '826139', finalGrade: 3},
  {id: 8, studentNumber: '849946', finalGrade: 2},
  {id: 9, studentNumber: '183958', finalGrade: 0},
  {id: 10, studentNumber: '686426', finalGrade: 0},
  {id: 11, studentNumber: '753213', finalGrade: 3},
  {id: 12, studentNumber: '279337', finalGrade: 5},
  {id: 13, studentNumber: '495298', finalGrade: 5},
  {id: 14, studentNumber: '638843', finalGrade: 3},
  {id: 15, studentNumber: '216384', finalGrade: 2},
];

export const mockTeacher: TeacherInCharge = new TeacherInCharge(
  {
    userId: 1,
    courseId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {isNewRecord: false}
);

// TODO: Test multiple final grades

beforeAll(async () => {
  cookies = await getCookies();
});

/**
 * Check that the expected number of grades exist for a user for
 * a specific attainment, including checking the numeric values of those grades.
 */
const checkGradeAmount = async (
  student: {id: number},
  expectedGrades: number[]
): Promise<void> => {
  console.log({userId: student.id, courseId: testCourseAddId});
  const dbAttainmentGrades = await FinalGrade.findAll({
    where: {userId: student.id, courseId: testCourseAddId},
  });
  console.log(JSON.stringify(dbAttainmentGrades, null, 4));

  const dbGrades = dbAttainmentGrades.map(
    attainmentGrade => attainmentGrade.grade
  );
  expect(dbGrades).toEqual(expectedGrades);
};

describe('Test GET /v1/courses/:courseId/finalGrades - get final grades', () => {
  it('should get final grades succesfully when course results are found (admin user)', async () => {
    const res = await request
      .get(`/v1/courses/${testCourseId}/finalGrades`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(FinalGradeDataSchema.strict()).nonempty();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should get final grades succesfully when course results are found (teacher in charge)', async () => {
    jest.spyOn(TeacherInCharge, 'findOne').mockResolvedValueOnce(mockTeacher);

    const res = await request
      .get(`/v1/courses/${testCourseId}/finalGrades`)
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
      .get(`/v1/courses/${testCourseId}/finalGrades`)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .get(`/v1/courses/${testCourse2Id}/finalGrades`)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .get(`/v1/courses/${badId}/finalGrades`)
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
      where: {userId: student.id, courseId: testCourseAddId},
    });

    expect(result).not.toBe(null);
    expect(result?.grade).toBe(student.finalGrade);
  };

  it('should calculate correct grade, numeric grade (admin user)', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseAddId}/finalGrades`)
      .send([getData(students[0])])
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGrade(students[0]);
  });

  it('should calculate correct grade, numeric grade (teacher in charge)', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseAddId}/finalGrades`)
      .send([getData(students[1])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGrade(students[1]);
  });

  it('should calculate multiple correct grades based on student numbers', async () => {
    const res = await request
      .post(`/v1/courses/${testCourseAddId}/finalGrades`)
      .send([getData(students[2]), getData(students[3])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGrade(students[2]);
    await checkGrade(students[3]);
  });

  it('should calculate multiple grades for the same attainment on repeated runs', async () => {
    await checkGradeAmount(students[4], []);

    const res = await request
      .post(`/v1/courses/${testCourseAddId}/finalGrades`)
      .send([getData(students[4])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGradeAmount(students[4], [students[4].finalGrade]);

    const res2 = await request
      .post(`/v1/courses/${testCourseAddId}/finalGrades`)
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
      .post(`/v1/courses/${testCourseAddId}/finalGrades`)
      .send([getData(students[4])])
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .post(`/v1/courses/${testCourse2Id}/finalGrades`)
      .send([getData(students[4])])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});
