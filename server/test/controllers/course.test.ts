// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {
  BaseCourseDataSchema,
  CourseData,
  EditCourseData,
  GradingScale,
  HttpCode,
  Language,
  NewCourseData,
  TeacherData,
} from '@common/types';
import {app} from '../../src/app';
import {
  findCourseFullById,
  parseCourseFull,
} from '../../src/controllers/utils/course';
import {createData} from '../util/createData';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let noRoleCourseId = -1;
const teachers: TeacherData[] = [];
const assistants: TeacherData[] = [];

const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();

  [courseId] = await createData.createCourse({});

  [noRoleCourseId] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });

  // Create teacher{1,2,3}@aalto.fi accounts
  for (let i = 1; i <= 3; i++) {
    const newUser = await createData.createUser({
      email: `teacher${i}@aalto.fi`,
      name: `teacher${i}`,
    });
    teachers.push(newUser as TeacherData);
  }

  // Create assistant{1,2,3}@aalto.fi accounts
  for (let i = 1; i <= 3; i++) {
    const newUser = await createData.createUser({
      email: `assistant${i}@aalto.fi`,
      name: `assistant${i}`,
    });
    teachers.push(newUser as TeacherData);
  }
});

afterAll(async () => {
  await resetDb();
});

const CourseSchema = BaseCourseDataSchema.strict().refine(
  val => val.maxCredits >= val.minCredits
);

describe('Test GET /v1/courses/:courseId - get course by ID', () => {
  it('should respond with correct data when course exists', async () => {
    const testCookies = [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
      cookies.studentCookie,
    ];
    for (const cookie of testCookies) {
      const res = await request
        .get(`/v1/courses/${courseId}`)
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = await CourseSchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = `/v1/courses/${1.2}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();

    url = `/v1/courses/${'abc'}`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${courseId}`;
    await responseTests.testUnauthorized(url).get();

    await responseTests
      .testForbidden(`/v1/courses/${noRoleCourseId}`, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const url = `/v1/courses/${nonExistentId}`;
    await responseTests.testNotFound(url, cookies.adminCookie).get();
  });
});

describe('Test GET /v1/courses - get all courses', () => {
  it('should respond with correct data', async () => {
    const res = await request
      .get('/v1/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(CourseSchema);
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    await responseTests.testUnauthorized('/v1/courses').get();

    await responseTests
      .testForbidden('/v1/courses', [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });
});

describe('Test POST /v1/courses - create new course', () => {
  let newCourseI = 0;
  const createCourse = (): NewCourseData => ({
    courseCode: `ELEC-A720${newCourseI++}`,
    minCredits: 5,
    maxCredits: 5,
    gradingScale: GradingScale.Numerical,
    languageOfInstruction: Language.English,
    teachersInCharge: ['teacher@aalto.fi'],
    assistants: ['assistant@aalto.fi'],
    department: {
      fi: 'Sähkötekniikan korkeakoulu',
      en: 'School of Electrical Engineering',
      sv: 'Högskolan för elektroteknik',
    },
    name: {
      fi: 'Signaalit ja järjestelmät',
      en: 'Signals and Systems',
      sv: '',
    },
  });

  it('should create a course', async () => {
    const res = await request
      .post('/v1/courses')
      .send(createCourse())
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const Schema = z.number().int();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request if validation fails', async () => {
    const url = '/v1/courses';
    await responseTests.testBadRequest(url, cookies.adminCookie).post({});
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const courseData = createCourse();
    await responseTests.testUnauthorized('/v1/courses').post(courseData);

    await responseTests
      .testForbidden('/v1/courses', [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post(courseData);
  });

  // TODO: Implement
  // it('should respond with 200 and add email to allowed idp users, if teacher email is not found from database', async () => {
  //   const input: NewCourseData = {
  //     courseCode: 'ELEC-A7200',
  //     minCredits: 5,
  //     maxCredits: 5,
  //     gradingScale: GradingScale.Numerical,
  //     languageOfInstruction: Language.English,
  //     teachersInCharge: ['new.teacher@aalto.fi'],
  //     assistants: [],
  //     department: {
  //       fi: 'Sähkötekniikan korkeakoulu',
  //       en: 'School of Electrical Engineering',
  //       sv: 'Högskolan för elektroteknik',
  //     },
  //     name: {
  //       fi: 'Signaalit ja järjestelmät',
  //       en: 'Signals and Systems',
  //       sv: '',
  //     },
  //   };

  //   const res = await request
  //     .post('/v1/courses')
  //     .send(input)
  //     .set('Cookie', cookies.adminCookie)
  //     .set('Accept', 'application/json')
  //     .expect(HttpCode.Created);

  //   const Schema = z.number().int();
  //   const result = await Schema.safeParseAsync(res.body);
  //   expect(result.success).toBeTruthy();
  // });
});

describe('Test PUT /v1/courses/:courseId - edit course', () => {
  const uneditedCourseDataBase: EditCourseData = {
    courseCode: 'CS-A????',
    teachersInCharge: [],
    minCredits: 5,
    maxCredits: 5,
    assistants: [],
    gradingScale: GradingScale.Numerical,
    languageOfInstruction: Language.English,
    department: {
      fi: 'Tietotekniikan laitos',
      en: 'Department of Computer Science',
      sv: 'Institutionen för datateknik',
    },
    name: {
      fi: '[Test] Edit course',
      en: '[Test] Edit course',
      sv: '[Test] Edit course',
    },
  };

  const courseDataEdits: EditCourseData = {
    courseCode: 'edited',
    teachersInCharge: [],
    minCredits: 3,
    maxCredits: 7,
    gradingScale: GradingScale.SecondNationalLanguage,
    languageOfInstruction: Language.English,
    department: {
      fi: 'muokattu laitos',
      en: 'edited department',
      sv: 'redigerad institutionen',
    },
    name: {
      fi: 'muokattu nimi',
      en: 'edited name',
      sv: 'redigerad namn',
    },
  };

  const findUsers = (emails: string[] | undefined): TeacherData[] => {
    if (emails === undefined) return [];
    const users = [];
    for (const email of emails) {
      let user = teachers.find(teacher => teacher.email === email);
      if (user !== undefined) {
        users.push(user);
        continue;
      }

      user = assistants.find(assistant => assistant.email === email);
      if (user !== undefined) {
        users.push(user);
        continue;
      }

      throw new Error(`Email ${email} not in test teachers | assistants`);
    }
    return users;
  };

  const testCourseEditSuccess = async (
    edit1: EditCourseData,
    edit2: EditCourseData
  ): Promise<void> => {
    const checkCourseData = async (expected: CourseData): Promise<void> => {
      const dbCourse = parseCourseFull(await findCourseFullById(courseId));
      dbCourse.teachersInCharge.sort((a, b) => a.id - b.id);
      expected.teachersInCharge.sort((a, b) => a.id - b.id);
      dbCourse.assistants.sort((a, b) => a.id - b.id);
      expected.assistants.sort((a, b) => a.id - b.id);
      expect(dbCourse).toStrictEqual(expected);
    };

    const initState = parseCourseFull(await findCourseFullById(courseId));

    const courseEdit1: CourseData = {
      ...initState,
      ...edit1,
      id: courseId,
      teachersInCharge: findUsers(edit1.teachersInCharge),
      assistants: findUsers(edit1.assistants),
    } as unknown as CourseData;

    const courseEdit2: CourseData = {
      ...initState,
      ...edit1,
      ...edit2,
      id: courseId,
      teachersInCharge: findUsers(edit2.teachersInCharge),
      assistants: findUsers(edit2.assistants),
    } as unknown as CourseData;

    await request
      .put(`/v1/courses/${courseId}`)
      .send(edit1)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    await checkCourseData(courseEdit1);

    await request
      .put(`/v1/courses/${courseId}`)
      .send(edit2)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    await checkCourseData(courseEdit2);
  };

  it('should successfully update course information', async () => {
    await testCourseEditSuccess(uneditedCourseDataBase, courseDataEdits);
  });

  it('should successfully add a single teacher in charge / assistant', async () => {
    await testCourseEditSuccess(
      {
        teachersInCharge: ['teacher1@aalto.fi'],
        assistants: ['assistant1@aalto.fi'],
      },
      {
        teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
        assistants: ['assistant1@aalto.fi', 'assistant2@aalto.fi'],
      }
    );
  });

  it('should successfully delete a single teacher in charge / assistant', async () => {
    await testCourseEditSuccess(
      {
        teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
        assistants: ['assistant1@aalto.fi', 'assistant2@aalto.fi'],
      },
      {
        teachersInCharge: ['teacher1@aalto.fi'],
        assistants: ['assistant1@aalto.fi'],
      }
    );
  });

  it('should successfully edit teachers in charge / assistants', async () => {
    await testCourseEditSuccess(
      {
        teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
        assistants: ['assistant1@aalto.fi', 'assistant2@aalto.fi'],
      },
      {
        teachersInCharge: ['teacher2@aalto.fi', 'teacher3@aalto.fi'],
        assistants: ['assistant2@aalto.fi', 'assistant3@aalto.fi'],
      }
    );
  });

  // TODO: Implement
  // it('should respond 200 and add idp user, if teacher email is not found from database', async () => {
  //   const res = await request
  //     .put(`/v1/courses/${editCourseId}`)
  //     .send({teachersInCharge: ['new.teacher2@aalto.fi']})
  //     .set('Cookie', cookies.adminCookie)
  //     .set('Accept', 'application/json')
  //     .expect(HttpCode.Created);

  //   const Schema = z.number().int();
  //   const result = await Schema.safeParseAsync(res.body);
  //   expect(result.success).toBeTruthy();
  // });

  it('should respond with 400 bad request, if body validation fails', async () => {
    const url = `/v1/courses/${courseId}`;
    const badRequest = responseTests.testBadRequest(url, cookies.adminCookie);

    await badRequest.put({teachersInCharge: [123]});
    await badRequest.put({minCredits: 10, maxCredits: 5});
    await badRequest.put({department: 'wrong', name: false});
    await badRequest.put({minCredits: -10});
    await badRequest.put({maxCredits: 1});
    await badRequest.put({minCredits: 9});
  });

  it('should respond with 400 bad request if id is invalid', async () => {
    const url = `/v1/courses/${-1}`;
    const data: EditCourseData = {maxCredits: 10};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url = `/v1/courses/${-1}`;
    const data: EditCourseData = {maxCredits: 10};
    await responseTests.testUnauthorized(url).put(data);

    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 not found, if the course ID does not exist', async () => {
    const url = `/v1/courses/${nonExistentId}`;
    const data: EditCourseData = {maxCredits: 10};
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });
});
