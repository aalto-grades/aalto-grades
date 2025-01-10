// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {
  type AssistantData,
  type CourseData,
  CourseDataArraySchema,
  CourseDataSchema,
  Department,
  type EditCourseData,
  GradingScale,
  HttpCode,
  IdSchema,
  Language,
  type NewCourseData,
  type TeacherData,
} from '@/common/types';
import {app} from '../../src/app';
import {
  findCourseFullById,
  parseCourseFull,
} from '../../src/controllers/utils/course';
import User from '../../src/database/models/user';
import {createData} from '../util/createData';
import {TEACHER_ID} from '../util/general';
import {type Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let noRoleCourseId = -1;
const teachers: TeacherData[] = [];
const assistants: AssistantData[] = [];

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
    assistants.push(newUser as AssistantData);
    for (const assistant of assistants) {
      assistant.expiryDate = null;
    }
  }
});

afterAll(async () => {
  await resetDb();
});

describe('Test GET /v1/courses/:courseId - get a course', () => {
  it('should get a course', async () => {
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

      const result = CourseDataSchema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if id is invalid', async () => {
    let url = '/v1/courses/1.2';
    await responseTests.testBadRequest(url, cookies.adminCookie).get();

    url = '/v1/courses/abc';
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
  it('should get all courses', async () => {
    const res = await request
      .get('/v1/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = CourseDataArraySchema.nonempty();
    const result = Schema.safeParse(res.body);
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
  const createCourseData = (): NewCourseData => ({
    courseCode: `ELEC-A720${newCourseI++}`,
    department: Department.ComputerScience,
    minCredits: 5,
    maxCredits: 5,
    gradingScale: GradingScale.Numerical,
    languageOfInstruction: Language.English,
    teachersInCharge: ['teacher@aalto.fi'],
    assistants: [{email: 'assistant@aalto.fi', expiryDate: new Date()}],
    name: {
      fi: 'Signaalit ja järjestelmät',
      en: 'Signals and Systems',
      sv: '',
    },
  });

  it('should create a course', async () => {
    const res = await request
      .post('/v1/courses')
      .send(createCourseData())
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const result = IdSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should create a course', async () => {
    for (const cookie of [
      cookies.adminCookie,
      cookies.teacherCookie,
      cookies.assistantCookie,
    ]) {
      const res = await request
        .post('/v1/courses')
        .send(createCourseData())
        .set('Cookie', cookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.Created);

      const result = IdSchema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if validation fails', async () => {
    const url = '/v1/courses';
    await responseTests.testBadRequest(url, cookies.adminCookie).post({});
  });

  // it('should respond with 401 or 403 if not authorized', async () => {
  //   const courseData = createCourseData();
  //   await responseTests.testUnauthorized('/v1/courses').post(courseData);

  //   await responseTests
  //     .testForbidden('/v1/courses', [
  //       cookies.teacherCookie,
  //       cookies.assistantCookie,
  //       cookies.studentCookie,
  //     ])
  //     .post(courseData);
  // });

  it('should create new IDP user when email does not exist', async () => {
    const courseData = createCourseData();

    const testData = {
      ...courseData,
      teachersInCharge: ['teacher@aalto.fi', 'teacher1000@aalto.fi'],
      assistants: [{email: 'assistant1000@aalto.fi', expiryDate: null}],
    };
    const res = await request
      .post('/v1/courses')
      .send(testData)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const result = IdSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();

    const newTeacher = await User.findByEmail('teacher1000@aalto.fi');
    expect(newTeacher).not.toBe(null);
    expect(newTeacher?.idpUser).toBeTruthy();

    const newAssistant = await User.findByEmail('assistant1000@aalto.fi');
    expect(newAssistant).not.toBe(null);
    expect(newAssistant?.idpUser).toBeTruthy();
  });

  it('should respond with 409 when course code exists', async () => {
    await createData.createCourse({courseData: {courseCode: 'CS-A9673'}});

    const url = '/v1/courses/';
    const testData = createCourseData();
    testData.courseCode = 'CS-A9673';
    await responseTests.testConflict(url, cookies.adminCookie).post(testData);
  });

  it('should respond with 422 when course has duplicate roles', async () => {
    const courseData = createCourseData();
    const url = '/v1/courses';

    let testData = {
      ...courseData,
      teachersInCharge: ['teacher@aalto.fi', 'teacher@aalto.fi'],
    };
    await responseTests
      .testUnprocessableEntity(url, cookies.adminCookie)
      .post(testData);

    testData = {
      ...courseData,
      assistants: [
        {email: 'assistant@aalto.fi', expiryDate: new Date()},
        {email: 'assistant@aalto.fi', expiryDate: new Date()},
      ],
    };
    await responseTests
      .testUnprocessableEntity(url, cookies.adminCookie)
      .post(testData);

    testData = {
      ...courseData,
      teachersInCharge: ['teacher@aalto.fi'],
      assistants: [{email: 'teacher@aalto.fi', expiryDate: new Date()}],
    };
    await responseTests
      .testUnprocessableEntity(url, cookies.adminCookie)
      .post(testData);
  });
});

describe('Test PUT /v1/courses/:courseId - edit course', () => {
  const uneditedCourseDataBase: EditCourseData = {
    courseCode: 'CS-A????',
    department: Department.ComputerScience,
    minCredits: 5,
    maxCredits: 5,
    gradingScale: GradingScale.Numerical,
    languageOfInstruction: Language.English,
    name: {
      fi: '[Test] Edit course',
      en: '[Test] Edit course',
      sv: '[Test] Edit course',
    },
    teachersInCharge: [],
    assistants: [],
  };

  const courseDataEdits: EditCourseData = {
    courseCode: 'CS-EDIT',
    department: Department.Architecture,
    minCredits: 3,
    maxCredits: 7,
    gradingScale: GradingScale.SecondNationalLanguage,
    languageOfInstruction: Language.Japanese,
    name: {
      fi: 'muokattu nimi',
      en: 'edited name',
      sv: 'redigerad namn',
    },
    teachersInCharge: [],
    assistants: [],
  };

  const findTeachers = (
    emails: string[] | undefined
  ): TeacherData[] | undefined => {
    if (emails === undefined) return undefined;
    const users = [];
    for (const email of emails) {
      const user = teachers.find(teacher => teacher.email === email);
      if (user !== undefined) {
        users.push(user);
        continue;
      }

      throw new Error(`Email ${email} not in test teachers`);
    }
    return users;
  };

  const findAssistants = (
    emails: string[] | undefined
  ): AssistantData[] | undefined => {
    if (emails === undefined) return undefined;
    const users = [];
    for (const email of emails) {
      const user = assistants.find(assistant => assistant.email === email);
      if (user !== undefined) {
        users.push(user);
        continue;
      }

      throw new Error(`Email ${email} not in test assistants`);
    }
    return users;
  };

  const testCourseEditSuccess = async (
    edit1: EditCourseData,
    edit2: EditCourseData,
    cookie: string[] = cookies.adminCookie
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
      teachersInCharge:
        findTeachers(edit1.teachersInCharge) ?? initState.teachersInCharge,
      assistants:
        findAssistants(edit1.assistants?.map(assistant => assistant.email)) ??
        initState.assistants,
    };

    const courseEdit2: CourseData = {
      ...initState,
      ...edit1,
      ...edit2,
      id: courseId,
      teachersInCharge:
        findTeachers(edit2.teachersInCharge) ??
        findTeachers(edit1.teachersInCharge) ??
        initState.teachersInCharge,
      assistants:
        findAssistants(edit2.assistants?.map(assistant => assistant.email)) ??
        findAssistants(edit1.assistants?.map(assistant => assistant.email)) ??
        initState.assistants,
    } as unknown as CourseData;

    await request
      .put(`/v1/courses/${courseId}`)
      .send(edit1)
      .set('Cookie', cookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    await checkCourseData(courseEdit1);

    await request
      .put(`/v1/courses/${courseId}`)
      .send(edit2)
      .set('Cookie', cookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    await checkCourseData(courseEdit2);
  };

  it('should edit a course', async () => {
    await testCourseEditSuccess(uneditedCourseDataBase, courseDataEdits);
  });

  it('should edit a course as a teacher', async () => {
    // Add teacher to the course first
    await request
      .put(`/v1/courses/${courseId}`)
      .send({teachersInCharge: ['teacher@aalto.fi']})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    await testCourseEditSuccess(
      {assistants: [{email: 'assistant1@aalto.fi', expiryDate: null}]},
      {
        assistants: [
          {email: 'assistant1@aalto.fi', expiryDate: null},
          {email: 'assistant2@aalto.fi', expiryDate: null},
        ],
      },
      cookies.teacherCookie
    );
  });

  it('should successfully add a single teacher in charge / assistant', async () => {
    await testCourseEditSuccess(
      {
        teachersInCharge: ['teacher1@aalto.fi'],
        assistants: [{email: 'assistant1@aalto.fi', expiryDate: null}],
      },
      {
        teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
        assistants: [
          {email: 'assistant1@aalto.fi', expiryDate: null},
          {email: 'assistant2@aalto.fi', expiryDate: null},
        ],
      }
    );
  });

  it('should successfully delete a single teacher in charge / assistant', async () => {
    await testCourseEditSuccess(
      {
        teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
        assistants: [
          {email: 'assistant1@aalto.fi', expiryDate: null},
          {email: 'assistant2@aalto.fi', expiryDate: null},
        ],
      },
      {
        teachersInCharge: ['teacher1@aalto.fi'],
        assistants: [{email: 'assistant1@aalto.fi', expiryDate: null}],
      }
    );
  });

  it('should successfully edit teachers in charge / assistants', async () => {
    await testCourseEditSuccess(
      {
        teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
        assistants: [
          {email: 'assistant1@aalto.fi', expiryDate: null},
          {email: 'assistant2@aalto.fi', expiryDate: null},
        ],
      },
      {
        teachersInCharge: ['teacher2@aalto.fi', 'teacher3@aalto.fi'],
        assistants: [
          {email: 'assistant2@aalto.fi', expiryDate: null},
          {email: 'assistant3@aalto.fi', expiryDate: null},
        ],
      }
    );
  });

  it('should respond with 400 if body validation fails', async () => {
    const url = `/v1/courses/${courseId}`;
    const badRequest = responseTests.testBadRequest(url, cookies.adminCookie);

    await badRequest.put({teachersInCharge: [123]});
    await badRequest.put({minCredits: 10, maxCredits: 5});
    await badRequest.put({department: 'wrong', name: false});
    await badRequest.put({minCredits: -10});
    await badRequest.put({maxCredits: 1});
    await badRequest.put({minCredits: 9});
  });

  it('should respond with 400 if id is invalid', async () => {
    const url = `/v1/courses/${-1}`;
    const data: EditCourseData = {maxCredits: 10};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 400 if trying to edit grading scale of a course with final grades', async () => {
    const [tmpCourseId, , , modelId] = await createData.createCourse({});
    const student = await createData.createUser();
    await createData.createFinalGrade(
      tmpCourseId,
      student.id,
      modelId,
      TEACHER_ID
    );

    const url = `/v1/courses/${tmpCourseId}`;
    const data: EditCourseData = {gradingScale: GradingScale.PassFail};
    await responseTests.testBadRequest(url, cookies.adminCookie).put(data);
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    let url = `/v1/courses/${courseId}`;
    const data: EditCourseData = {
      assistants: [{email: 'assistant1@aalto.fi', expiryDate: new Date()}],
    };
    await responseTests.testUnauthorized(url).put(data);

    await responseTests
      .testForbidden(url, [cookies.assistantCookie, cookies.studentCookie])
      .put(data);

    url = `/v1/courses/${noRoleCourseId}`;
    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .put(data);
  });

  it('should respond with 404 if not found', async () => {
    const url = `/v1/courses/${nonExistentId}`;
    const data: EditCourseData = {maxCredits: 10};
    await responseTests.testNotFound(url, cookies.adminCookie).put(data);
  });

  it('should create new IDP user when email does not exist', async () => {
    const testData: EditCourseData = {
      teachersInCharge: ['teacher@aalto.fi', 'teacher2000@aalto.fi'],
      assistants: [{email: 'assistant2000@aalto.fi', expiryDate: new Date()}],
    };
    await request
      .put(`/v1/courses/${courseId}`)
      .send(testData)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const newTeacher = await User.findByEmail('teacher2000@aalto.fi');
    expect(newTeacher).not.toBe(null);
    expect(newTeacher?.idpUser).toBeTruthy();

    const newAssistant = await User.findByEmail('assistant2000@aalto.fi');
    expect(newAssistant).not.toBe(null);
    expect(newAssistant?.idpUser).toBeTruthy();
  });

  it('should respond with 409 when course code exists', async () => {
    await createData.createCourse({courseData: {courseCode: 'CS-A7407'}});

    const url = `/v1/courses/${courseId}`;
    const testData: EditCourseData = {courseCode: 'CS-A7407'};
    await responseTests.testConflict(url, cookies.adminCookie).put(testData);
  });

  it('should respond with 422 when course has duplicate roles', async () => {
    const url = `/v1/courses/${courseId}`;

    let testData: EditCourseData = {
      teachersInCharge: ['teacher@aalto.fi', 'teacher@aalto.fi'],
    };
    await responseTests
      .testUnprocessableEntity(url, cookies.adminCookie)
      .put(testData);

    testData = {
      assistants: [
        {email: 'assistant@aalto.fi', expiryDate: new Date()},
        {email: 'assistant@aalto.fi', expiryDate: new Date()},
      ],
    };
    await responseTests
      .testUnprocessableEntity(url, cookies.adminCookie)
      .put(testData);

    testData = {
      teachersInCharge: ['teacher@aalto.fi'],
      assistants: [{email: 'teacher@aalto.fi', expiryDate: new Date()}],
    };
    await responseTests
      .testUnprocessableEntity(url, cookies.adminCookie)
      .put(testData);
  });
});
