// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {
  CourseData,
  GradingScale,
  HttpCode,
  Language,
  UserData,
} from '@common/types';
import supertest from 'supertest';

import {app} from '../../src/app';
import {
  findCourseFullById,
  parseCourseFull,
} from '../../src/controllers/utils/course';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);
const badId: number = 1000000;
let cookies: Cookies = {
  adminCookie: [],
  userCookie: [],
};

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test GET /v1/courses/:courseId - get course by ID', () => {
  it('should respond with correct data when course exists', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.courseCode).toBeDefined();
    expect(res.body.data.minCredits).toBeDefined();
    expect(res.body.data.maxCredits).toBeDefined();
    expect(res.body.data.gradingScale).toBeDefined();
    expect(res.body.data.department).toBeDefined();
    expect(res.body.data.languageOfInstruction).toBeDefined();
    expect(res.body.data.name).toBeDefined();
  });

  it('should respond with 400 bad request, if validation fails (non-number course id)', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses/abc')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/courses/1')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 404 not found, if nonexistent course id', async () => {
    const res: supertest.Response = await request
      .get(`/v1/courses/${badId}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toBeDefined();
  });
});

describe('Test GET /v1/courses - get all courses', () => {
  it('should respond with correct data', async () => {
    const res: supertest.Response = await request
      .get('/v1/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data[0].id).toBeDefined();
    expect(res.body.data[0].courseCode).toBeDefined();
    expect(res.body.data[0].minCredits).toBeDefined();
    expect(res.body.data[0].maxCredits).toBeDefined();
    expect(res.body.data[0].gradingScale).toBeDefined();
    expect(res.body.data[0].department).toBeDefined();
    expect(res.body.data[0].languageOfInstruction).toBeDefined();
    expect(res.body.data[0].name).toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/courses')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });
});

describe('Test POST /v1/courses - create new course', () => {
  it('should respond with course ID on correct input (admin user)', async () => {
    let input: object = {
      courseCode: 'ELEC-A7200',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
          email: 'thomas.siegel@aalto.fi',
        },
      ],
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
    let res: supertest.Response = await request
      .post('/v1/courses')
      .send(input)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();

    input = {
      courseCode: 'ELEC-A7200',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.PassFail,
      languageOfInstruction: 'en',
      teachersInCharge: [
        {
          email: 'thomas.siegel@aalto.fi',
        },
        {
          email: 'arthur.james@aalto.fi',
        },
      ],
      department: {
        fi: 'Sähkötekniikan korkeakoulu',
        en: 'School of Electrical Engineering',
      },
      name: {
        fi: 'Signaalit ja järjestelmät',
        en: 'Signals and Systems',
      },
    };
    res = await request
      .post('/v1/courses')
      .send(input)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();
  });

  it('should respond with 400 bad request, if required fields are undefined', async () => {
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send({})
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toContain('courseCode is a required field');
    expect(res.body.errors).toContain('department is a required field');
    expect(res.body.errors).toContain('name is a required field');
    expect(res.body.errors).toContain('minCredits is a required field');
    expect(res.body.errors).toContain('teachersInCharge is a required field');
    expect(res.body.errors).toContain('name is a required field');
    expect(res.body.errors).toContain(
      'languageOfInstruction is a required field'
    );
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .post('/v1/courses')
      .send({})
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 403 forbidden, if not admin user', async () => {
    await request
      .post('/v1/courses')
      .send({})
      .set('Cookie', cookies.userCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);
  });

  it('should respond with 422 unprocessable entity, if teacher email is not found from database', async () => {
    const input: object = {
      courseCode: 'ELEC-A7200',
      minCredits: 5,
      maxCredits: 5,
      gradingScale: GradingScale.Numerical,
      languageOfInstruction: Language.English,
      teachersInCharge: [
        {
          email: 'not.found@aalto.fi',
        },
      ],
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

    const res: supertest.Response = await request
      .post('/v1/courses')
      .send(input)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.UnprocessableEntity);

    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0]).toBe(
      'No user with email address not.found@aalto.fi found'
    );
    expect(res.body.data).not.toBeDefined();
  });

  /* TODO: move next test case elsewhere in future, after refactoring commonly
   * reusable functionality (e.g. middleware) to their own modules / functions
   */

  it('should respond with syntax error, if parsing request JSON fails', async () => {
    const input: string = '{"courseCode": "ELEC-A7200"';
    const res: supertest.Response = await request
      .post('/v1/courses')
      .send(input)
      .set('Content-Type', 'application/json')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.data).not.toBeDefined();
    expect(res.body.errors).toContain(
      'SyntaxError: Unexpected end of JSON input: {"courseCode": "ELEC-A7200"'
    );
  });
});

describe('Test PUT /v1/courses/:courseId - edit course', () => {
  const uneditedCourseDataBase: object = {
    minCredits: 5,
    maxCredits: 5,
    gradingScale: GradingScale.PassFail,
    languageOfInstruction: Language.English,
    department: {
      fi: 'muokkaamaton laitos',
      en: 'unedited department',
      sv: 'oredigerad institutionen',
    },
    name: {
      fi: 'muokkaamaton nimi',
      en: 'unedited name',
      sv: 'oredigerad namn',
    },
  };

  const courseDataEdits: object = {
    courseCode: 'edited',
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

  async function testCourseEditSuccess(
    courseId: number,
    uneditedCourseData: object,
    edits: object,
    editedTeachersInCharge?: Array<UserData>
  ): Promise<void> {
    async function checkCourseData(
      courseId: number,
      expected: CourseData
    ): Promise<void> {
      expect(
        parseCourseFull(
          await findCourseFullById(courseId, HttpCode.InternalServerError)
        )
      ).toStrictEqual(expected);
    }

    const course: CourseData = {
      ...uneditedCourseData,
      id: courseId,
    } as unknown as CourseData;

    checkCourseData(courseId, course);

    const res: supertest.Response = await request
      .put(`/v1/courses/${courseId}`)
      .send(edits)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data).toBeDefined();

    const editedCourseData: CourseData = {...course, ...edits};
    if (editedTeachersInCharge)
      editedCourseData.teachersInCharge = editedTeachersInCharge;

    expect(res.body.data).toStrictEqual(editedCourseData);
    checkCourseData(courseId, editedCourseData);
  }

  it('should successfully update course information', async () => {
    await testCourseEditSuccess(
      10,
      {
        ...uneditedCourseDataBase,
        courseCode: 'Test edit course',
        teachersInCharge: [
          {id: 50, name: 'Everett Dennis', email: 'everett.dennis@aalto.fi'},
        ],
      },
      courseDataEdits
    );
  });

  it('should successfully add a single teacher in charge', async () => {
    await testCourseEditSuccess(
      10,
      {
        ...uneditedCourseDataBase,
        ...courseDataEdits,
        teachersInCharge: [
          {id: 50, name: 'Everett Dennis', email: 'everett.dennis@aalto.fi'},
        ],
      },
      {
        teachersInCharge: [
          {email: 'everett.dennis@aalto.fi'},
          {email: 'larissa.poore@aalto.fi'},
        ],
      },
      [
        {id: 50, name: 'Everett Dennis', email: 'everett.dennis@aalto.fi'},
        {id: 100, name: 'Larissa Poore', email: 'larissa.poore@aalto.fi'},
      ]
    );
  });

  it('should successfully delete a single teacher in charge', async () => {
    await testCourseEditSuccess(
      10,
      {
        ...uneditedCourseDataBase,
        ...courseDataEdits,
        teachersInCharge: [
          {id: 50, name: 'Everett Dennis', email: 'everett.dennis@aalto.fi'},
          {id: 100, name: 'Larissa Poore', email: 'larissa.poore@aalto.fi'},
        ],
      },
      {
        teachersInCharge: [{email: 'larissa.poore@aalto.fi'}],
      },
      [{id: 100, name: 'Larissa Poore', email: 'larissa.poore@aalto.fi'}]
    );
  });

  it('should successfully update course information and teachers in charge', async () => {
    await testCourseEditSuccess(
      11,
      {
        ...uneditedCourseDataBase,
        courseCode: 'Test edit course and teachers',
        teachersInCharge: [
          {id: 100, name: 'Larissa Poore', email: 'larissa.poore@aalto.fi'},
          {id: 200, name: 'Harriet Maestas', email: 'harriet.maestas@aalto.fi'},
          {
            id: 300,
            name: 'Charles Morrissey',
            email: 'charles.morrissey@aalto.fi',
          },
        ],
      },
      {
        ...courseDataEdits,
        teachersInCharge: [
          {email: 'larissa.poore@aalto.fi'},
          {email: 'donald.perez@aalto.fi'},
        ],
      },
      [
        {id: 100, name: 'Larissa Poore', email: 'larissa.poore@aalto.fi'},
        {id: 101, name: 'Donald Perez', email: 'donald.perez@aalto.fi'},
      ]
    );
  });

  it('should respond with 400 bad request, if body validation fails', async () => {
    async function badInput(input: object): Promise<void> {
      const res: supertest.Response = await request
        .put('/v1/courses/10')
        .send(input)
        .set('Cookie', cookies.adminCookie)
        .set('Accept', 'application/json')
        .expect(HttpCode.BadRequest);

      expect(res.body.errors).toBeDefined();
      expect(res.body.data).not.toBeDefined();
    }

    await badInput({
      teachersInCharge: [{id: 5}, {email: 'user@email.com'}],
    });
    await badInput({
      minCredits: 10,
      maxCredits: 5,
    });
    await badInput({
      department: 'wrong',
      name: false,
    });
    await badInput({
      minCredits: -10,
    });
    await badInput({
      maxCredits: 1,
    });
    await badInput({
      minCredits: 9,
    });
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .put('/v1/courses/10')
      .send(courseDataEdits)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

  it('should respond with 403 forbidden, if not admin user', async () => {
    await request
      .put('/v1/courses/10')
      .send(courseDataEdits)
      .set('Cookie', cookies.userCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);
  });

  it('should respond with 404 not found, if the course ID does not exist', async () => {
    await request
      .put(`/v1/courses/${badId}`)
      .send(courseDataEdits)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);
  });

  it('should respond with 422 unprocessable entity, if teacher email is not found from database', async () => {
    await request
      .put('/v1/courses/10')
      .send({
        teachersInCharge: [{email: 'this.is.not@a.real.email'}],
      })
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.UnprocessableEntity);
  });
});
