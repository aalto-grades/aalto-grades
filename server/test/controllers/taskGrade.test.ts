// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import assert from 'assert';
import supertest from 'supertest';

import {
  type CourseTaskData,
  type EditTaskGradeData,
  GradingScale,
  HttpCode,
  LatestGradesSchema,
  type NewTaskGrade,
  StudentRowArraySchema,
} from '@/common/types';
import {app} from '../../src/app';
import * as gradesUtil from '../../src/controllers/utils/taskGrade';
import TaskGrade from '../../src/database/models/taskGrade';
import User from '../../src/database/models/user';
import {createData} from '../util/createData';
import {NEXT_YEAR, TEACHER_ID, convertDate} from '../util/general';
import {type Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let courseTasks: CourseTaskData[] = [];
let editGradeId = -1;
let aplusGradeSourceId = -1;
let aplusCourseTaskId = -1;
let noRoleCourseId = -1;
let noRoleCourseTasks: CourseTaskData[] = [];
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
  [courseId, , courseTasks, gradingModelId] = await createData.createCourse({
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
    courseTasks[0].id,
    TEACHER_ID
  );

  [noRoleCourseId, , noRoleCourseTasks] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  noRoleGradeId = await createData.createGrade(
    students[0].id,
    noRoleCourseTasks[0].id,
    TEACHER_ID
  );

  [[aplusCourseTaskId, aplusGradeSourceId]] =
    await createData.createAplusGradeSources(courseId);
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

      const Schema = StudentRowArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = '/v1/courses/bad/grades';
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
  const genGrades = async (studentNumber?: string): Promise<NewTaskGrade[]> => {
    if (studentNumber === undefined)
      studentNumber = (await genStudent()).studentNumber;

    return [
      {
        studentNumber: studentNumber,
        courseTaskId: courseTasks[0].id,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: NEXT_YEAR,
        comment: '',
      },
      {
        studentNumber: studentNumber,
        courseTaskId: courseTasks[1].id,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: NEXT_YEAR,
        comment: '',
      },
      {
        studentNumber: studentNumber,
        courseTaskId: courseTasks[2].id,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: NEXT_YEAR,
        comment: '',
      },
      {
        studentNumber: studentNumber,
        courseTaskId: aplusCourseTaskId,
        aplusGradeSourceId: aplusGradeSourceId,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: NEXT_YEAR,
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

    const taskGrade = await TaskGrade.findOne({
      where: {
        userId: student.id,
        courseTaskId: courseTasks[0].id,
      },
    });

    expect(taskGrade?.graderId).toBe(1);
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

    const grade = await TaskGrade.findOne({
      where: {
        userId: student.id,
        courseTaskId: courseTasks[0].id,
      },
    });
    expect(grade?.grade).toEqual(data[0].grade);
    expect(grade?.userId).toEqual(student.id);
    expect(grade?.courseTaskId).toEqual(courseTasks[0].id);
  });

  it('should allow uploading multiple grades to the same course task for a student', async () => {
    const student = await genStudent();

    const upload = async (): Promise<NewTaskGrade[]> => {
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
    let grades = await TaskGrade.findAll({
      where: {userId: student.id, courseTaskId: courseTasks[0].id},
    });
    expect(grades.length).toEqual(1);
    expect(grades[0].grade).toEqual(data1[0].grade);

    const data2 = await upload();
    grades = await TaskGrade.findAll({
      where: {userId: student.id, courseTaskId: courseTasks[0].id},
    });
    expect(grades.length).toEqual(2);
    expect(grades.find(val => val.grade === data1[0].grade)).toBeDefined();
    expect(grades.find(val => val.grade === data2[0].grade)).toBeDefined();
  });

  it('should update existing grade for a student from an A+ grade source rather than adding a new grade', async () => {
    const student = await genStudent();

    const upload = async (): Promise<NewTaskGrade[]> => {
      const data = (await genGrades(student.studentNumber)).filter(
        grade => grade.aplusGradeSourceId !== undefined
      );

      const res = await request
        .post(`/v1/courses/${courseId}/grades`)
        .send(data)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
      return data;
    };

    let data = await upload();
    let grades = await TaskGrade.findAll({
      where: {userId: student.id, courseTaskId: aplusCourseTaskId},
    });
    expect(grades.length).toEqual(1);
    expect(grades[0].grade).toEqual(data[0].grade);

    data = await upload();
    grades = await TaskGrade.findAll({
      where: {userId: student.id, courseTaskId: aplusCourseTaskId},
    });
    expect(grades.length).toEqual(1);
    expect(grades[0].grade).toEqual(data[0].grade);
  });

  // If this test fails due to a timeout, it is most likely due to some unoptimized code.
  it(
    'should process big json successfully (5 000 x 3 x 2 = 90 000 individual grades)',
    async () => {
      const data: NewTaskGrade[] = [];
      for (let studentNum = 10000; studentNum < 15000; studentNum++) {
        for (let submission = 0; submission < 2; submission++) {
          const newData = await genGrades(studentNum.toString());
          data.push(newData[0], newData[1], newData[2]);
        }
      }
      const res = await request
        .post(`/v1/courses/${courseId}/grades`)
        .send(data)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
    },
    20 * 1000 // 20 seconds should be enough
  );

  it('should respond with 400 if validation fails', async () => {
    const url = `/v1/courses/${courseId}/grades`;
    const data = (await genGrades())[0];

    // Invalid grade type
    await responseTests
      .testBadRequest(url, cookies.teacherCookie)
      .post({...data, grade: '10'});

    await responseTests.testBadRequest(url, cookies.teacherCookie).post({
      ...data,
      date: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
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

  it('should respond with 409 when course task does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/grades`;
    const student = await genStudent();
    const data: NewTaskGrade[] = [
      {
        studentNumber: student.studentNumber,
        courseTaskId: noRoleCourseTasks[0].id,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: NEXT_YEAR,
        comment: '',
      },
    ];

    await responseTests.testConflict(url, cookies.adminCookie).post(data);
  });

  it('should respond with 409 when A+ grade source does not belong to course task', async () => {
    const url = `/v1/courses/${courseId}/grades`;
    const student = await genStudent();
    const data: NewTaskGrade[] = [
      {
        studentNumber: student.studentNumber,
        courseTaskId: courseTasks[0].id,
        aplusGradeSourceId: aplusGradeSourceId,
        grade: Math.floor(Math.random() * 11),
        date: new Date(),
        expiryDate: NEXT_YEAR,
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
          expiryDate: NEXT_YEAR,
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

    let data: EditTaskGradeData = {
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
    let url = `/v1/courses/bad/grades/${editGradeId}`;
    const data = {comment: 'not edited'};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);

    url = `/v1/courses/${courseId}/grades/${-1}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 400 if trying to edit the grade field of an A+ grade', async () => {
    const user = await createData.createUser();
    const gradeId = await createData.createGrade(
      user.id,
      aplusCourseTaskId,
      TEACHER_ID,
      undefined,
      undefined,
      aplusGradeSourceId
    );

    const url = `/v1/courses/${courseId}/grades/${gradeId}`;
    await responseTests
      .testBadRequest(url, cookies.adminCookie)
      .put({grade: 5});
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
    return createData.createGrade(user.id, courseTasks[0].id, TEACHER_ID);
  };
  const gradeDoesNotExist = async (id: number): Promise<void> => {
    const result = await TaskGrade.findOne({where: {id: id}});
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
    let url = `/v1/courses/bad/grades/${editGradeId}`;
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

describe('Test POST /v1/latest-grades - fetch latest grades for multiple students', () => {
  const createGrades = async (): Promise<[number, Date]> => {
    const user = await createData.createUser();
    let latestDate = new Date(0);

    const start = new Date(2020, 0, 1);
    const end = new Date(2024, 6, 1);
    for (let i = 0; i < 5; i++) {
      const gradeDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
      await createData.createGrade(
        user.id,
        courseTasks[0].id,
        TEACHER_ID,
        undefined,
        gradeDate
      );
      if (gradeDate > latestDate) latestDate = gradeDate;
    }
    return [user.id, latestDate];
  };

  it('should fetch latest grades for multiple students', async () => {
    const data: [number, Date | null][] = [];
    for (let i = 0; i < 10; i++) data.push(await createGrades());
    const user = await createData.createUser();
    data.push([user.id, null]);

    const res = await request
      .post('/v1/latest-grades')
      .send(data.map(item => item[0]))
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = LatestGradesSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();

    if (result.success) {
      const resMap = new Map<number, Date | null>(
        result.data.map(item => [item.userId, item.date])
      );

      for (const item of data) {
        const gradeDate = item[1] === null ? item[1] : convertDate(item[1]);

        expect(gradeDate).toEqual(resMap.get(item[0]));
      }
    }
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const userIds = [];
    for (let i = 0; i < 10; i++) userIds.push((await createGrades())[0]);

    await responseTests.testUnauthorized('/v1/latest-grades').post(userIds);

    await responseTests
      .testForbidden('/v1/latest-grades', [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(userIds);
  });

  it('should respond with 404 if not found', async () => {
    const userIds = [];
    for (let i = 0; i < 10; i++) userIds.push((await createGrades())[0]);
    userIds.push(nonExistentId);

    const url = '/v1/latest-grades';
    await responseTests.testNotFound(url, cookies.adminCookie).post(userIds);
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

  beforeEach(() => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => new Date('2023-06-21').getTime());
    jest
      .spyOn(gradesUtil, 'getDateOfLatestGrade')
      .mockImplementation(async () => Promise.resolve(new Date('2023-06-21')));
  });

  afterEach(() => {
    jest.spyOn(global.Date, 'now').mockRestore();
    jest.spyOn(gradesUtil, 'getDateOfLatestGrade').mockRestore();
  });

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
        assessmentDate: null,
        completionLanguage: null,
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
    const [passFailCourseId, , , modelId] = await createData.createCourse({
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
${students[0].studentNumber},fail,5,21.6.2023,en,
${students[1].studentNumber},pass,5,21.6.2023,en,\n`);
    expect(res.headers['content-disposition']).toBe(
      'attachment; filename="final_grades_course_CS-A9542_' +
        `${new Date().toLocaleDateString('fi-FI')}.csv"`
    );
  });

  it('should export CSV when gradingScale is secondary language', async () => {
    const [passFailCourseId, , , modelId] = await createData.createCourse({
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
