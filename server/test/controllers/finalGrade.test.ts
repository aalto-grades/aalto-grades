// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import assert from 'assert';
import supertest from 'supertest';

import {
  type EditFinalGrade,
  FinalGradeDataArraySchema,
  GradingScale,
  HttpCode,
  type NewFinalGrade,
} from '@/common/types';
import {app} from '../../src/app';
import FinalGrade from '../../src/database/models/finalGrade';
import {createData} from '../util/createData';
import {TEACHER_ID} from '../util/general';
import {type Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let editCourseId = -1;
let editFinalGradeId = -1;
let editCourseModelId = -1;
let passFailCourseId = -1;
let passFailCourseModelId = -1;
let secondaryLangCourseId = -1;
let secondaryLangCourseModelId = -1;
let noRoleCourseId = -1;
let noRoleFinalGradeId = -1;
const nonExistentId = 1000000;

const nonExistentStudentNumber = '945942';
const students: {id: number; studentNumber: string; finalGrade: number}[] = [];
let studentNumbers: string[] = [];

beforeAll(async () => {
  cookies = await getCookies();

  let gradingModelId;
  [courseId, , , gradingModelId] = await createData.createCourse({
    courseData: {maxCredits: 5, courseCode: 'CS-84389'},
  });
  // Create 10 final grades
  for (let i = 0; i < 10; i++) {
    const student = await createData.createUser();
    await createData.createFinalGrade(
      courseId,
      student.id,
      gradingModelId,
      TEACHER_ID
    );
    // Create multiple final grades for some students
    if (i < 2) {
      await createData.createFinalGrade(
        courseId,
        student.id,
        gradingModelId,
        TEACHER_ID
      );
    }
  }

  [editCourseId, , , editCourseModelId] = await createData.createCourse({});
  const user = await createData.createUser();
  editFinalGradeId = await createData.createFinalGrade(
    editCourseId,
    user.id,
    null,
    TEACHER_ID
  );

  [passFailCourseId, , , passFailCourseModelId] = await createData.createCourse(
    {
      courseData: {
        gradingScale: GradingScale.PassFail,
        maxCredits: 5,
        courseCode: 'CS-A9542',
      },
    }
  );
  [secondaryLangCourseId, , , secondaryLangCourseModelId] =
    await createData.createCourse({
      courseData: {
        gradingScale: GradingScale.SecondNationalLanguage,
        maxCredits: 5,
        courseCode: 'CS-A8341',
      },
    });

  [noRoleCourseId] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  noRoleFinalGradeId = await createData.createFinalGrade(
    noRoleCourseId,
    user.id,
    null,
    TEACHER_ID
  );

  // Create students & final grades for Sisu CSV test
  for (let i = 0; i < 10; i++) {
    const newUser = await createData.createUser();
    assert(newUser.studentNumber); // Fix typescript warning
    students.push({
      id: newUser.id,
      studentNumber: newUser.studentNumber,
      finalGrade: Math.floor(Math.random() * 6),
    });
  }
  studentNumbers = students.map(student => student.studentNumber);

  for (const student of students) {
    // Create a worse final grade before the actual one
    if (student.finalGrade > 0) {
      await createData.createFinalGrade(
        courseId,
        student.id,
        gradingModelId,
        TEACHER_ID,
        student.finalGrade -
          Math.floor(Math.random() * (student.finalGrade + 1))
      );
    }

    await createData.createFinalGrade(
      courseId,
      student.id,
      gradingModelId,
      TEACHER_ID,
      student.finalGrade
    );

    // Create a worse final grade after the actual one
    if (student.finalGrade > 0) {
      await createData.createFinalGrade(
        courseId,
        student.id,
        gradingModelId,
        TEACHER_ID,
        student.finalGrade -
          Math.floor(Math.random() * (student.finalGrade + 1))
      );
    }
  }
});

afterAll(async () => {
  await resetDb();
});

/**
 * Check that the expected number of grades exist for a user for a specific
 * course part, including checking the numeric values of those grades.
 */
const checkGradeAmount = async (
  student: {id: number},
  expectedGrades: number[]
): Promise<void> => {
  const dbFinalGrades = await FinalGrade.findAll({
    where: {userId: student.id, courseId: editCourseId},
  });

  const dbGrades = dbFinalGrades.map(finalGrade => finalGrade.grade);
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

      const Schema = FinalGradeDataArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = '/v1/courses/bad/final-grades';
    await responseTests.testBadRequest(url, cookies.adminCookie).get();

    url = '/v1/courses/1.5/final-grades';
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
    gradingModelId: editCourseModelId,
    grade: student.finalGrade,
    date: new Date(),
    comment: null,
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
      gradingModelId: editCourseModelId,
      grade: student.finalGrade,
      date: new Date(),
    };

    const url = `/v1/courses/${editCourseId}/final-grades`;
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 400 if id is invalid', async () => {
    const student = await createStudent();
    const data = [getData(student)];

    const url = '/v1/courses/bad/final-grades';
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 400 if trying to add grade >1 to a pass/fail course', async () => {
    const student = await createStudent();
    const data = [getData(student)];
    data[0].grade = 2; // Make sure at least some grade is >1

    const url = `/v1/courses/${passFailCourseId}/final-grades`;
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 400 if trying to add grade >2 to a secondary language course', async () => {
    const student = await createStudent();
    const data = [getData(student)];
    data[0].grade = 3; // Make sure at least some grade is >2

    const url = `/v1/courses/${secondaryLangCourseId}/final-grades`;
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

  it('should respond with 404 when not found', async () => {
    const student = await createStudent();
    const data = [getData(student)];
    const url = `/v1/courses/${nonExistentId}/final-grades`;
    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 409 when grading model does not belong to the course', async () => {
    const student = await createStudent();
    const [, , , otherCourseModelId] = await createData.createCourse({});
    const data: NewFinalGrade[] = [
      {
        userId: student.id,
        gradingModelId: otherCourseModelId,
        grade: student.finalGrade,
        date: new Date(),
        comment: null,
      },
    ];

    const url = `/v1/courses/${editCourseId}/final-grades`;
    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });
});

describe('Test PUT /v1/courses/:courseId/final-grades/:finalGradeId - edit a final grade', () => {
  it('should edit a final grade', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const testDay = new Date(2024, 0, Math.floor(Math.random() * 20));
      const res = await request
        .put(`/v1/courses/${editCourseId}/final-grades/${editFinalGradeId}`)
        .send({
          grade: Math.floor(Math.random() * 6),
          date: testDay,
          sisuExportDate: new Date(testDay.getTime() + 365 * 24 * 3600 * 1000),
          comment: `testing ${Math.random()}`,
        })
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
    }
  });

  it('should partially edit grade', async () => {
    let res = await request
      .put(`/v1/courses/${editCourseId}/final-grades/${editFinalGradeId}`)
      .send({grade: Math.floor(Math.random() * 6)})
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');

    res = await request
      .put(`/v1/courses/${editCourseId}/final-grades/${editFinalGradeId}`)
      .send({date: new Date(2023, 0, 1), comment: 'Edited!'})
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 400 if validation fails', async () => {
    let url = `/v1/courses/${editCourseId}/final-grades/${editFinalGradeId}`;

    let data: EditFinalGrade = {grade: '1' as unknown as number};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    // Try editing date / grade of non-manual grade
    const user = await createData.createUser();
    const finalGradeId = await createData.createFinalGrade(
      editCourseId,
      user.id,
      editCourseModelId,
      TEACHER_ID,
      0
    );
    url = `/v1/courses/${editCourseId}/final-grades/${finalGradeId}`;
    data = {grade: 5};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
    data = {date: new Date(2023, 0, 1)};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/bad/final-grades/${editFinalGradeId}`;
    const data = {grade: 3};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${editCourseId}/parts/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${editCourseId}/final-grades/${editFinalGradeId}`;
    const data = {grade: 3};
    await responseTests.testUnauthorized(url).put(data);

    await responseTests.testForbidden(url, [cookies.studentCookie]).put(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .put(data);

    url = `/v1/courses/${noRoleCourseId}/final-grades/${noRoleFinalGradeId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${editCourseId}/final-grades/${nonExistentId}`;
    const data = {comment: 'not edited'};
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${nonExistentId}/final-grades/${editFinalGradeId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 when grade does not belong to course', async () => {
    const url = `/v1/courses/${editCourseId}/final-grades/${noRoleFinalGradeId}`;
    const data = {comment: 'not edited'};

    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });
});

describe('Test Delete/v1/courses/:courseId/final-grades/:finalGradeId - delete a final grade', () => {
  const createFinalGrade = async (): Promise<number> => {
    const user = await createData.createUser();
    return createData.createFinalGrade(
      editCourseId,
      user.id,
      editCourseModelId,
      TEACHER_ID
    );
  };
  const gradeDoesNotExist = async (id: number): Promise<void> => {
    const result = await FinalGrade.findByPk(id);
    expect(result).toBeNull();
  };

  it('should delete a final grade', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const finalGradeId = await createFinalGrade();

      const res = await request
        .delete(`/v1/courses/${editCourseId}/final-grades/${finalGradeId}`)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await gradeDoesNotExist(finalGradeId);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/bad/final-grades/${editFinalGradeId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();

    url = `/v1/courses/${editCourseId}/final-grades/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${editCourseId}/final-grades/${editFinalGradeId}`;
    await responseTests.testUnauthorized(url).delete();

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .delete();

    url = `/v1/courses/${noRoleCourseId}/final-grades/${noRoleFinalGradeId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${nonExistentId}/final-grades/${editFinalGradeId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();

    url = `/v1/courses/${editCourseId}/final-grades/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 when grade does not belong to course', async () => {
    const url = `/v1/courses/${editCourseId}/final-grades/${noRoleFinalGradeId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });
});

describe('Test POST /v1/courses/:courseId/grades/csv/sisu - export Sisu compatible grading in CSV', () => {
  const today = new Date().toLocaleDateString('FI-fi');
  const createCSVString = (
    studentData: {studentNumber: string; finalGrade: number}[],
    dateStr: string,
    language: string
  ): string[] => {
    const data = [];
    for (const student of studentData) {
      const csvStudent = `${student.studentNumber},${student.finalGrade}`;
      data.push(`${csvStudent},5,${dateStr},${language}`);
    }
    return data;
  };

  it('should export CSV', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const res = await request
        .post(`/v1/courses/${courseId}/grades/csv/sisu`)
        .send({studentNumbers, assessmentDate: null, completionLanguage: null})
        .set('Cookie', cookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);

      expect(res.text)
        .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
${createCSVString(students, today, 'en').join(',\n')},\n`);
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="final_grades_course_CS-84389_' +
          `${new Date().toLocaleDateString('fi-FI')}.csv"`
      );
    }
  });

  it('should export only selected grades', async () => {
    const selectedStudents = [students[0], students[3], students[6]];
    const res = await request
      .post(`/v1/courses/${courseId}/grades/csv/sisu`)
      .send({
        studentNumbers: selectedStudents.map(student => student.studentNumber),
        assessmentDate: null,
        completionLanguage: null,
      })
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
${createCSVString(selectedStudents, today, 'en').join(',\n')},\n`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-84389_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV successfully with custom assessmentDate and completionLanguage', async () => {
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
${createCSVString(students, '12.5.2023', 'ja').join(',\n')},\n`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-84389_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV when gradingScale is pass/fail', async () => {
    const studentNums = [];
    for (let i = 0; i <= 1; i++) {
      studentNums.push(students[i].studentNumber);
      await createData.createFinalGrade(
        passFailCourseId,
        students[i].id,
        passFailCourseModelId,
        TEACHER_ID,
        i
      );
    }
    const res = await request
      .post(`/v1/courses/${passFailCourseId}/grades/csv/sisu`)
      .send({
        studentNumbers: studentNums,
        assessmentDate: null,
        completionLanguage: null,
      })
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
${students[0].studentNumber},fail,5,${today},en,
${students[1].studentNumber},pass,5,${today},en,\n`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A9542_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV when gradingScale is secondary language', async () => {
    const studentNums = [];
    for (let i = 0; i <= 2; i++) {
      studentNums.push(students[i].studentNumber);
      await createData.createFinalGrade(
        secondaryLangCourseId,
        students[i].id,
        secondaryLangCourseModelId,
        TEACHER_ID,
        i
      );
    }
    const res = await request
      .post(`/v1/courses/${secondaryLangCourseId}/grades/csv/sisu`)
      .send({
        studentNumbers: studentNums,
        assessmentDate: null,
        completionLanguage: null,
      })
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
${students[0].studentNumber},Fail,5,${today},en,
${students[1].studentNumber},SAT,5,${today},en,
${students[2].studentNumber},G,5,${today},en,\n`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A8341_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/grades/csv/sisu`;
    const badRequest = responseTests.testBadRequest(url, cookies.adminCookie);

    await badRequest.post({
      studentNumbers,
      assessmentDate: null,
      completionLanguage: 'ja',
    });
    await badRequest.post({
      studentNumbers,
      assessmentDate: '2024-12-00T00:00:00.000Z',
    });
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = '/v1/courses/bad/grades/csv/sisu';
    const data = {
      studentNumbers,
      assessmentDate: null,
      completionLanguage: null,
    };
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/grades/csv/sisu`;
    const data = {
      studentNumbers,
      assessmentDate: null,
      completionLanguage: null,
    };
    await responseTests.testUnauthorized(url).post(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .post(data);

    url = `/v1/courses/${noRoleCourseId}/grading-models`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 404 if grades have not been calculated yet', async () => {
    const url = `/v1/courses/${noRoleCourseId}/grades/csv/sisu`;
    const data = {
      studentNumbers: [studentNumbers[0]],
      assessmentDate: null,
      completionLanguage: null,
    };

    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 404 if student number not found', async () => {
    const url = `/v1/courses/${noRoleCourseId}/grades/csv/sisu`;
    const data = {
      studentNumbers: [nonExistentStudentNumber],
      assessmentDate: null,
      completionLanguage: null,
    };

    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/courses/${nonExistentId}/grades/csv/sisu`;
    const data = {
      studentNumbers,
      assessmentDate: null,
      completionLanguage: null,
    };

    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });
});
