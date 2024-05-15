// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {FinalGradeDataSchema, HttpCode, NewFinalGrade} from '@/common/types';
import {app} from '../../src/app';
import FinalGrade from '../../src/database/models/finalGrade';
import {createData} from '../util/createData';
import {TEACHER_ID} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let editCourseId = -1;
let editCourseModelId = -1;
let noRoleCourseId = -1;
const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();

  let assessmentModelId;
  [courseId, , assessmentModelId] = await createData.createCourse({});
  // Create 10 final grades
  for (let i = 0; i < 10; i++) {
    const student = await createData.createUser();
    await createData.createFinalGrade(
      courseId,
      student.id,
      assessmentModelId,
      TEACHER_ID
    );
    // Create multiple final grades for some students
    if (i < 2) {
      await createData.createFinalGrade(
        courseId,
        student.id,
        assessmentModelId,
        TEACHER_ID
      );
    }
  }

  [editCourseId, , editCourseModelId] = await createData.createCourse({});

  [noRoleCourseId] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
});

afterAll(async () => {
  await resetDb();
});

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

describe('Test GET /v1/courses/:courseId/final-grades - get all final grades', () => {
  it('should get all final grades', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/final-grades`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = z.array(FinalGradeDataSchema.strict()).nonempty();
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${'bad'}/final-grades`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();

    url = `/v1/courses/${1.5}/final-grades`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/final-grades`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(`/v1/courses/${courseId}/final-grades`, [
        cookies.studentCookie,
      ])
      .get();

    await responseTests
      .testForbidden(`/v1/courses/${noRoleCourseId}/final-grades`, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${nonExistentId}/final-grades`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/final-grades - add final grades', () => {
  type StudentData = {id: number; finalGrade: number};
  const createStudent = async (): Promise<StudentData> => {
    const user = await createData.createUser();
    return {id: user.id, finalGrade: Math.floor(Math.random() * 6)};
  };
  const getData = (student: StudentData): NewFinalGrade => ({
    userId: student.id,
    assessmentModelId: editCourseModelId,
    grade: student.finalGrade,
    date: new Date(),
  });
  const checkGrade = async (student: StudentData): Promise<void> => {
    const result = await FinalGrade.findOne({
      where: {userId: student.id, courseId: editCourseId},
    });

    expect(result).not.toBe(null);
    expect(result?.grade).toBe(student.finalGrade);
  };

  it('should add a final grade', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];

    for (const cookie of testCookies) {
      const student = await createStudent();

      const res = await request
        .post(`/v1/courses/${editCourseId}/final-grades`)
        .send([getData(student)])
        .set('Cookie', cookie)
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkGrade(student);
    }
  });

  it('should add multiple final grades', async () => {
    const student1 = await createStudent();
    const student2 = await createStudent();

    const res = await request
      .post(`/v1/courses/${editCourseId}/final-grades`)
      .send([getData(student1), getData(student2)])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGrade(student1);
    await checkGrade(student2);
  });

  it('should add multiple final grades for the same student', async () => {
    const student = await createStudent();
    await checkGradeAmount(student, []);

    const res = await request
      .post(`/v1/courses/${editCourseId}/final-grades`)
      .send([getData(student)])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkGradeAmount(student, [student.finalGrade]);

    const res2 = await request
      .post(`/v1/courses/${editCourseId}/final-grades`)
      .send([getData(student)])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res2.body)).toBe('{}');
    await checkGradeAmount(student, [student.finalGrade, student.finalGrade]);
  });

  it('should respond with 400 if validation fails', async () => {
    const student = await createStudent();
    const data = {
      userId: student.id,
      assessmentModelId: editCourseModelId,
      grade: student.finalGrade,
      date: new Date(),
    };

    const url = `/v1/courses/${editCourseId}/final-grades`;
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 400 if id is invalid', async () => {
    const student = await createStudent();
    const data = [getData(student)];

    const url = `/v1/courses/${'bad'}/final-grades`;
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const student = await createStudent();
    const data = [getData(student)];

    let url = `/v1/courses/${editCourseId}/final-grades`;
    await responseTests.testUnauthorized(url).post(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .post(data);

    url = `/v1/courses/${noRoleCourseId}/final-grades`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 409 when assessment model does not belong to the course', async () => {
    const student = await createStudent();
    const [, , otherCourseModelId] = await createData.createCourse({});
    const data = [
      {
        userId: student.id,
        assessmentModelId: otherCourseModelId,
        grade: student.finalGrade,
        date: new Date(),
      },
    ];

    const url = `/v1/courses/${editCourseId}/final-grades`;
    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });

  it('should respond with 404 when not found', async () => {
    const student = await createStudent();
    const data = [getData(student)];
    const url = `/v1/courses/${nonExistentId}/final-grades`;
    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });
});
