// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import assert from 'assert';
import supertest from 'supertest';
import {z} from 'zod';

import {
  HttpCode,
  CoursePartData,
  NewGrade,
  StudentRowSchema,
  EditGradeData,
  GradingScale,
} from '@/common/types';
import {app} from '../../src/app';
import * as gradesUtil from '../../src/controllers/utils/grades';
import AttainmentGrade from '../../src/database/models/attainmentGrade';
import User from '../../src/database/models/user';
import {createData} from '../util/createData';
import {TEACHER_ID} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let courseParts: CoursePartData[] = [];
let editGradeId = -1;
let noRoleCourseId = -1;
let noRoleCourseParts: CoursePartData[] = [];
let noRoleGradeId = -1;
const nonExistentId = 1000000;
const newStudentNumber = '867493';
const nonExistentStudentNumber = '945942';

const students: {id: number; studentNumber: string; finalGrade: number}[] = [];
let studentNumbers: string[] = [];

beforeAll(async () => {
  cookies = await getCookies();

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

  let gradingModelId: number;
  [courseId, courseParts, gradingModelId] = await createData.createCourse({
    courseData: {maxCredits: 5, courseCode: 'CS-A????'},
  });
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
  editGradeId = await createData.createGrade(
    students[0].id,
    courseParts[0].id,
    TEACHER_ID
  );

  [noRoleCourseId, noRoleCourseParts] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  noRoleGradeId = await createData.createGrade(
    students[0].id,
    noRoleCourseParts[0].id,
    TEACHER_ID
  );
});

afterAll(async () => {
  await resetDb();
});

describe('Test GET /v1/courses/:courseId/grades - get all grades', () => {
  it('should get the grades', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}/grades`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = z.array(StudentRowSchema.strict()).nonempty();
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${'bad'}/grades`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}/grades`;
    await responseTests.testUnauthorized(url).get();

    await responseTests.testForbidden(url, [cookies.studentCookie]).get();

    await responseTests
      .testForbidden(`/v1/courses/${noRoleCourseId}/grades`, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${nonExistentId}/grades`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/grades - add grades', () => {
  const genStudent = async (): Promise<{id: number; studentNumber: string}> => {
    const newUser = await createData.createUser();
    assert(newUser.studentNumber); // Fix typescript warning
    return {
      id: newUser.id,
      studentNumber: newUser.studentNumber,
    };
  };
  const genGrades = async (studentNumber?: string): Promise<NewGrade[]> => {
    if (studentNumber === undefined)
      studentNumber = (await genStudent()).studentNumber;

    return [
      {
        studentNumber: studentNumber,
        coursePartId: courseParts[0].id,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
        comment: '',
      },
      {
        studentNumber: studentNumber,
        coursePartId: courseParts[1].id,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
        comment: '',
      },
      {
        studentNumber: studentNumber,
        coursePartId: courseParts[2].id,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
        comment: '',
      },
    ];
  };

  it('should add grades', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
    ];

    for (const cookie of testCookies) {
      const res = await request
        .post(`/v1/courses/${courseId}/grades`)
        .send(await genGrades())
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
    }
  });

  it('should create user when it does not exist in database', async () => {
    let users = await User.findAll({
      where: {studentNumber: newStudentNumber},
    });
    expect(users.length).toBe(0);

    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(await genGrades(newStudentNumber))
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
    const student = await genStudent();
    const res = await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(await genGrades(student.studentNumber))
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');

    const userCoursePart = await AttainmentGrade.findOne({
      where: {
        userId: student.id,
        coursePartId: courseParts[0].id,
      },
    });

    expect(userCoursePart?.graderId).toBe(1);
  });

  it('grades should be in the database', async () => {
    const student = await genStudent();
    const data = await genGrades(student.studentNumber);
    await request
      .post(`/v1/courses/${courseId}/grades`)
      .send(data)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const grade = await AttainmentGrade.findOne({
      where: {
        userId: student.id,
        coursePartId: courseParts[0].id,
      },
    });
    expect(grade?.grade).toEqual(data[0].grade);
    expect(grade?.userId).toEqual(student.id);
    expect(grade?.coursePartId).toEqual(courseParts[0].id);
  });

  it('should allow uploading multiple grades to the same course part for a student', async () => {
    const student = await genStudent();

    const upload = async (): Promise<NewGrade[]> => {
      const data = await genGrades(student.studentNumber);
      const res = await request
        .post(`/v1/courses/${courseId}/grades`)
        .send(data)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
      return data;
    };

    const data1 = await upload();
    let grades = await AttainmentGrade.findAll({
      where: {userId: student.id, coursePartId: courseParts[0].id},
    });
    expect(grades.length).toEqual(1);
    expect(grades[0].grade).toEqual(data1[0].grade);

    const data2 = await upload();
    grades = await AttainmentGrade.findAll({
      where: {userId: student.id, coursePartId: courseParts[0].id},
    });
    expect(grades.length).toEqual(2);
    expect(grades.find(val => val.grade === data1[0].grade)).toBeDefined();
    expect(grades.find(val => val.grade === data2[0].grade)).toBeDefined();
  });

  it('should process big json succesfully (5 000 x 3 x 2 = 90 000 individual grades)', async () => {
    const data: NewGrade[] = [];
    for (let i = 10000; i < 15000; i++) {
      for (let j = 0; j < 2; j++) {
        const newData = await genGrades(i.toString());
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

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/grades`;
    const data = (await genGrades())[0];

    // Invalid grade type
    await responseTests
      .testBadRequest(url, cookies.teacherCookie)
      .post({...data, grade: '10'});

    await responseTests.testBadRequest(url, cookies.teacherCookie).post({
      ...data,
      date: new Date(new Date().getTime() + 2 * 365 * 24 * 60 * 60 * 1000),
    });
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/grades`;
    const data = await genGrades();
    await responseTests.testUnauthorized(url).post(data);

    await responseTests.testForbidden(url, [cookies.studentCookie]).post(data);

    url = `/v1/courses/${noRoleCourseId}/grades`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(data);
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/courses/${nonExistentId}/grades`;
    const data = await genGrades();
    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 409 when course-part does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/grades`;
    const student = await genStudent();
    const data = [
      {
        studentNumber: student.studentNumber,
        coursePartId: noRoleCourseParts[0].id,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: new Date(new Date().getTime() + 365 * 24 * 3600 * 1000),
        comment: '',
      },
    ];

    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });
});

describe('Test PUT /v1/courses/:courseId/grades/:gradeId - edit a grade', () => {
  it('should edit grade', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .put(`/v1/courses/${courseId}/grades/${editGradeId}`)
        .send({
          grade: Math.floor(Math.random() * 11),
          date: new Date(),
          expiryDate: new Date(new Date().getTime() + 365 * 24 * 3600 * 1000),
          comment: `testing ${Math.random()}`,
        })
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
    }
  });

  it('should partially edit grade', async () => {
    let res = await request
      .put(`/v1/courses/${courseId}/grades/${editGradeId}`)
      .send({
        comment: `testing ${Math.random()}`,
      })
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');

    res = await request
      .put(`/v1/courses/${courseId}/grades/${editGradeId}`)
      .send({
        grade: 5,
      })
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/grades/${editGradeId}`;

    let data: EditGradeData = {
      comment: 'not edited',
      grade: '1' as unknown as number,
    };
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    // Expiry before date
    data = {expiryDate: new Date(1970, 0, 1), date: new Date(2000, 0, 1)};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    // Expiry before date
    data = {expiryDate: new Date(1970, 0, 1)};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    // Date after expiry
    data = {date: new Date(2100, 0, 1)};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${'bad'}/grades/${editGradeId}`;
    const data = {comment: 'not edited'};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${courseId}/course-parts/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/grades/${editGradeId}`;
    const data = {comment: 'not edited'};
    await responseTests.testUnauthorized(url).put(data);

    await responseTests.testForbidden(url, [cookies.studentCookie]).put(data);

    url = `/v1/courses/${noRoleCourseId}/grades/${noRoleGradeId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${courseId}/grades/${nonExistentId}`;
    const data = {comment: 'not edited'};
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${nonExistentId}/grades/${courseId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });

  it('should respond with 409 when grade does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/grades/${noRoleGradeId}`;
    const data = {comment: 'not edited'};

    await responseTests.testConflict(url, cookies.adminCookie).put(data);
  });
});

describe('Test Delete/v1/courses/:courseId/grades/:gradeId - delete a grade', () => {
  const createGrade = async (): Promise<number> => {
    const user = await createData.createUser();
    return await createData.createGrade(user.id, courseParts[0].id, TEACHER_ID);
  };
  const gradeDoesNotExist = async (id: number): Promise<void> => {
    const result = await AttainmentGrade.findOne({where: {id: id}});
    expect(result).toBeNull();
  };

  it('should delete a grade', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
    ];
    for (const cookie of testCookies) {
      const gradeId = await createGrade();

      const res = await request
        .delete(`/v1/courses/${courseId}/grades/${gradeId}`)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      await gradeDoesNotExist(gradeId);
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${'bad'}/grades/${editGradeId}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();

    url = `/v1/courses/${courseId}/grades/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).delete();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/grades/${editGradeId}`;
    await responseTests.testUnauthorized(url).delete();

    await responseTests.testForbidden(url, [cookies.studentCookie]).delete();

    url = `/v1/courses/${noRoleCourseId}/grades/${noRoleGradeId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 if not found', async () => {
    let url = `/v1/courses/${nonExistentId}/grades/${editGradeId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();

    url = `/v1/courses/${courseId}/grades/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 when grade does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/grades/${noRoleGradeId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });
});

describe('Test POST /v1/courses/:courseId/grades/csv/sisu - export Sisu compatible grading in CSV', () => {
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

  jest
    .spyOn(global.Date, 'now')
    .mockImplementation(() => new Date('2023-06-21').getTime());

  jest
    .spyOn(gradesUtil, 'getDateOfLatestGrade')
    .mockImplementation(() => Promise.resolve(new Date('2023-06-21')));

  it('should export CSV', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const res = await request
        .post(`/v1/courses/${courseId}/grades/csv/sisu`)
        .send({studentNumbers})
        .set('Cookie', cookie)
        .set('Accept', 'text/csv')
        .expect(HttpCode.Ok);

      expect(res.text)
        .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
${createCSVString(students, '21.6.2023', 'en').join(',\n')},\n`);
      expect(res.headers['content-disposition']).toBe(
        'attachment; filename="final_grades_course_CS-A????_' +
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
      })
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
${createCSVString(selectedStudents, '21.6.2023', 'en').join(',\n')},\n`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A????_' +
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
      'attachment; filename="final_grades_course_CS-A????_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV when gradingScale is pass/fail', async () => {
    const [passFailCourseId, , modelId] = await createData.createCourse({
      courseData: {
        gradingScale: GradingScale.PassFail,
        maxCredits: 5,
        courseCode: 'CS-A9542',
      },
    });
    const studentNums = [];
    for (let i = 0; i <= 1; i++) {
      studentNums.push(students[i].studentNumber);
      await createData.createFinalGrade(
        passFailCourseId,
        students[i].id,
        modelId,
        TEACHER_ID,
        i
      );
    }
    const res = await request
      .post(`/v1/courses/${passFailCourseId}/grades/csv/sisu`)
      .send({studentNumbers: studentNums})
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
${students[0].studentNumber},fail,5,21.6.2023,en,
${students[1].studentNumber},pass,5,21.6.2023,en,\n`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A9542_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV when gradingScale is secondary language', async () => {
    const [passFailCourseId, , modelId] = await createData.createCourse({
      courseData: {
        gradingScale: GradingScale.SecondNationalLanguage,
        maxCredits: 5,
        courseCode: 'CS-A8341',
      },
    });
    const studentNums = [];
    for (let i = 0; i <= 2; i++) {
      studentNums.push(students[i].studentNumber);
      await createData.createFinalGrade(
        passFailCourseId,
        students[i].id,
        modelId,
        TEACHER_ID,
        i
      );
    }
    const res = await request
      .post(`/v1/courses/${passFailCourseId}/grades/csv/sisu`)
      .send({studentNumbers: studentNums})
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'text/csv')
      .expect(HttpCode.Ok);

    expect(res.text)
      .toBe(`studentNumber,grade,credits,assessmentDate,completionLanguage,comment
${students[0].studentNumber},Fail,5,21.6.2023,en,
${students[1].studentNumber},SAT,5,21.6.2023,en,
${students[2].studentNumber},G,5,21.6.2023,en,\n`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A8341_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/grades/csv/sisu`;
    const badRequest = responseTests.testBadRequest(url, cookies.adminCookie);

    await badRequest.post({studentNumbers, completionLanguage: 'ja'});
    await badRequest.post({
      studentNumbers,
      assessmentDate: '2024-12-00T00:00:00.000Z',
    });
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${'bad'}/grades/csv/sisu`;
    const data = {studentNumbers};
    await responseTests.testBadRequest(url, cookies.adminCookie).post(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}/grades/csv/sisu`;
    const data = {studentNumbers};
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
    const data = {studentNumbers: [studentNumbers[0]]};

    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 404 if student number not found', async () => {
    const url = `/v1/courses/${noRoleCourseId}/grades/csv/sisu`;
    const data = {studentNumbers: [nonExistentStudentNumber]};

    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/courses/${nonExistentId}/grades/csv/sisu`;
    const data = {studentNumbers};

    await responseTests.testNotFound(url, cookies.adminCookie).post(data);
  });
});
