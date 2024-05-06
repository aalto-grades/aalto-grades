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
import {ErrorSchema, ZodErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';

const request = supertest(app);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
const teachers: TeacherData[] = [];

const nonExistentId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();

  [courseId] = await createData.createCourse({});

  for (let i = 1; i <= 3; i++) {
    const newUser = await createData.createUser({
      email: `teacher${i}@aalto.fi`,
      name: `teacher${i}`,
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
    const res = await request
      .get(`/v1/courses/${courseId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await CourseSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if validation fails (non-number course id)', async () => {
    const res = await request
      .get('/v1/courses/abc')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .get(`/v1/courses/${courseId}`)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });

  it('should respond with 404 not found, if nonexistent course id', async () => {
    const res = await request
      .get(`/v1/courses/${nonExistentId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
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

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .get('/v1/courses')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });
});

describe('Test POST /v1/courses - create new course', () => {
  it('should respond with course ID on correct input (admin user)', async () => {
    let input: NewCourseData = {
      courseCode: 'ELEC-A7200',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: ['teacher1@aalto.fi'],
      assistants: [],
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
    };
    let res = await request
      .post('/v1/courses')
      .send(input)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const Schema = z.number().int();
    let result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();

    input = {
      courseCode: 'ELEC-A7200',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.PassFail,
      languageOfInstruction: Language.Finnish,
      teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
      assistants: [],
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
    };
    res = await request
      .post('/v1/courses')
      .send(input)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if required fields are undefined', async () => {
    const res = await request
      .post('/v1/courses')
      .send({})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ZodErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .post('/v1/courses')
      .send({})
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });

  it('should respond with 403 forbidden, if not admin user', async () => {
    const res = await request
      .post('/v1/courses')
      .send({})
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
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

  /*
   * TODO: move next test case elsewhere in future, after refactoring commonly
   * reusable functionality (e.g. middleware) to their own modules / functions
   */
  it('should respond with syntax error, if parsing request JSON fails', async () => {
    const res = await request
      .post('/v1/courses')
      .send('{"courseCode": "ELEC-A7200"')
      .set('Content-Type', 'application/json')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();

    if (result.success)
      expect(result.data.errors[0].startsWith('SyntaxError:')).toBeTruthy();
  });
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

  const testCourseEditSuccess = async (
    uneditedCourseData: EditCourseData,
    edits: EditCourseData,
    uneditedTeachersInCharge: TeacherData[],
    editedTeachersInCharge: TeacherData[]
  ): Promise<void> => {
    const checkCourseData = async (expected: CourseData): Promise<void> => {
      const dbCourse = parseCourseFull(
        await findCourseFullById(courseId, HttpCode.InternalServerError)
      );
      dbCourse.teachersInCharge.sort((a, b) => a.id - b.id);
      expected.teachersInCharge.sort((a, b) => a.id - b.id);
      expect(dbCourse).toStrictEqual(expected);
    };

    const course: CourseData = {
      ...uneditedCourseData,
      id: courseId,
      teachersInCharge: uneditedTeachersInCharge,
    } as unknown as CourseData;

    const editedCourseData: CourseData = {
      ...uneditedCourseData,
      ...edits,
      id: courseId,
      teachersInCharge: editedTeachersInCharge,
    } as unknown as CourseData;

    await request
      .put(`/v1/courses/${courseId}`)
      .send(uneditedCourseData)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    await checkCourseData(course);

    await request
      .put(`/v1/courses/${courseId}`)
      .send(edits)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    await checkCourseData(editedCourseData);
  };

  it('should successfully update course information', async () => {
    await testCourseEditSuccess(
      {
        ...uneditedCourseDataBase,
        courseCode: 'Test edit course',
        teachersInCharge: ['teacher1@aalto.fi'],
        assistants: [],
      },
      courseDataEdits,
      [teachers[0]],
      []
    );
  });

  it('should successfully add a single teacher in charge', async () => {
    await testCourseEditSuccess(
      {
        ...uneditedCourseDataBase,
        ...courseDataEdits,
        teachersInCharge: ['teacher1@aalto.fi'],
        assistants: [],
      },
      {
        teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
      },
      [teachers[0]],
      [teachers[0], teachers[1]]
    );
  });

  it('should successfully delete a single teacher in charge', async () => {
    await testCourseEditSuccess(
      {
        ...uneditedCourseDataBase,
        ...courseDataEdits,
        teachersInCharge: ['teacher1@aalto.fi', 'teacher2@aalto.fi'],
        assistants: [],
      },
      {teachersInCharge: ['teacher2@aalto.fi']},
      [teachers[0], teachers[1]],
      [teachers[1]]
    );
  });

  it('should successfully update course information and teachers in charge', async () => {
    await testCourseEditSuccess(
      {
        ...uneditedCourseDataBase,
        courseCode: 'Test edit course and teachers',
        teachersInCharge: [
          'teacher1@aalto.fi',
          'teacher2@aalto.fi',
          'teacher3@aalto.fi',
        ],
        assistants: [],
      },
      {
        ...courseDataEdits,
        teachersInCharge: ['teacher2@aalto.fi', 'teacher3@aalto.fi'],
      },
      [teachers[0], teachers[1], teachers[2]],
      [teachers[1], teachers[2]]
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
    const badInput = async (input: object): Promise<void> => {
      const res = await request
        .put(`/v1/courses/${courseId}`)
        .send(input)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      const Schema = z.union([ZodErrorSchema, ErrorSchema]);
      const result = await Schema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    };

    await badInput({teachersInCharge: [123]});
    await badInput({minCredits: 10, maxCredits: 5});
    await badInput({department: 'wrong', name: false});
    await badInput({minCredits: -10});
    await badInput({maxCredits: 1});
    await badInput({minCredits: 9});
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .put(`/v1/courses/${courseId}`)
      .send(courseDataEdits)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}'); // Passport does not call next() on error
  });

  it('should respond with 403 forbidden, if not admin user', async () => {
    const res = await request
      .put(`/v1/courses/${courseId}`)
      .send(courseDataEdits)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 404 not found, if the course ID does not exist', async () => {
    const res = await request
      .put(`/v1/courses/${nonExistentId}`)
      .send(courseDataEdits)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});
