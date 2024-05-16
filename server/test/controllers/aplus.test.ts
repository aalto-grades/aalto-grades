// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosError, AxiosStatic} from 'axios';
import supertest from 'supertest';

import {
  AttainmentData,
  AplusExerciseDataSchema,
  AplusGradeSourceData,
  AplusGradeSourceType,
  HttpCode,
  NewGradeArraySchema,
} from '@/common/types';
import {app} from '../../src/app';
import {APLUS_API_URL} from '../../src/configs/environment';
import AplusGradeSource from '../../src/database/models/aplusGradeSource';
import {createData} from '../util/createData';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let addGradeSourceAttainmentId = -1;
let noGradeSourceAttainmentId = -1;
let fullPointsAttainmentId = -1;
let moduleAttainmentId = -1;
let difficultyAttainmentId = -1;
let noRoleCourseId = -1;
let differentCourseAttainmentId = -1;

const nonExistentId = 1000000;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

beforeAll(async () => {
  cookies = await getCookies();
  let _;

  let attainments: AttainmentData[];
  [courseId, attainments, _] = await createData.createCourse({});
  [fullPointsAttainmentId, moduleAttainmentId, difficultyAttainmentId] =
    await createData.createAplusGradeSources(courseId);
  addGradeSourceAttainmentId = attainments[0].id;
  noGradeSourceAttainmentId = attainments[3].id;

  let otherAttainments: AttainmentData[];
  [noRoleCourseId, otherAttainments, _] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  differentCourseAttainmentId = otherAttainments[0].id;

  // eslint-disable-next-line @typescript-eslint/require-await
  mockedAxios.get.mockImplementation(async url => {
    const urlPoints = `${APLUS_API_URL}/courses/1/points?format=json`;
    const urlA = `${APLUS_API_URL}/courses/1/points/1?format=json`;
    const urlB = `${APLUS_API_URL}/courses/1/points/2?format=json`;

    /* eslint-disable camelcase */
    switch (url) {
      case urlPoints:
        return {
          data: {
            results: [{points: urlA}, {points: urlB}],
          },
        };

      case urlA:
        return {
          data: {
            student_id: '123456',
            points: 50,
            points_by_difficulty: {
              A: 30,
            },
            modules: [
              {
                id: 1,
                points: 10,
              },
              {
                id: 2,
                points: 40,
              },
            ],
          },
        };

      case urlB:
        return {
          data: {
            student_id: '654321',
            points: 40,
            points_by_difficulty: {
              A: 25,
            },
            modules: [
              {
                id: 1,
                points: 7,
              },
              {
                id: 2,
                points: 33,
              },
            ],
          },
        };
    }
    /* eslint-enable camelcase */
  });
});

afterAll(async () => {
  await resetDb();
});

describe('Test GET /v1/aplus/courses/:aplusCourseId - get A+ exercise data', () => {
  it('should respond with correct data', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      /* eslint-disable camelcase */
      data: {
        results: [
          {
            id: 1,
            display_name: 'First',
            exercises: [{difficulty: 'A'}, {difficulty: ''}],
          },
          {
            id: 2,
            display_name: 'Second',
            exercises: [{difficulty: ''}],
          },
        ],
      },
      /* eslint-enable camelcase */
    });

    const res = await request
      .get('/v1/aplus/courses/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await AplusExerciseDataSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 if validation fails (non-number A+ course ID)', async () => {
    const url = '/v1/aplus/courses/abc';
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 401 if not logged in', async () => {
    const url = '/v1/aplus/courses/1';
    await responseTests.testUnauthorized(url).get();
  });

  it('should respond with 502 if A+ request fails', async () => {
    mockedAxios.get.mockImplementationOnce(_url => {
      throw new AxiosError();
    });

    const url = '/v1/aplus/courses/1';
    await responseTests.testBadGateway(url, cookies.adminCookie).get();
  });
});

describe('Test POST /v1/courses/:courseId/aplus-source - add A+ grade sources', () => {
  const getGradeSource = (
    sourceType: AplusGradeSourceType,
    {
      withModuleId = false,
      withDifficulty = false,
      attainmentId = addGradeSourceAttainmentId,
    }
  ): AplusGradeSourceData => ({
    attainmentId: attainmentId,
    aplusCourseId: 1,
    sourceType: sourceType,
    moduleId: withModuleId ? 1 : undefined,
    difficulty: withDifficulty ? 'A' : undefined,
  });

  const getFullPoints = (): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.FullPoints, {});

  const getModule = (): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.Module, {withModuleId: true});

  const getDifficulty = (): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.Difficulty, {withDifficulty: true});

  const checkAplusGradeSource = async (
    gradeSource: AplusGradeSourceData
  ): Promise<void> => {
    const result = await AplusGradeSource.findOne({
      where: {
        attainmentId: gradeSource.attainmentId,
        aplusCourseId: gradeSource.aplusCourseId,
        sourceType: gradeSource.sourceType,
        moduleId: gradeSource.moduleId ?? null,
        difficulty: gradeSource.difficulty ?? null,
      },
    });

    expect(result).not.toBe(null);
  };

  it('should add sources (admin user)', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/aplus-source`)
      .send([getFullPoints(), getModule(), getDifficulty()])
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAplusGradeSource(getFullPoints());
    await checkAplusGradeSource(getModule());
    await checkAplusGradeSource(getDifficulty());
  });

  it('should add sources (teacher user)', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/aplus-source`)
      .send([getFullPoints(), getModule(), getDifficulty()])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAplusGradeSource(getFullPoints());
    await checkAplusGradeSource(getModule());
    await checkAplusGradeSource(getDifficulty());
  });

  it('should respond with 400 if course ID is invalid', async () => {
    const url = '/v1/courses/abc/aplus-source';
    await responseTests
      .testBadRequest(url, cookies.adminCookie)
      .post([getFullPoints(), getModule(), getDifficulty()]);
  });

  it('should respond with 400 if input data is invalid', async () => {
    const url = `/v1/courses/${courseId}/aplus-source`;

    // prettier-ignore
    const invalid: [AplusGradeSourceType, boolean, boolean][] = [
      [AplusGradeSourceType.FullPoints, true,  true],
      [AplusGradeSourceType.FullPoints, true,  false],
      [AplusGradeSourceType.FullPoints, false, true],
      [AplusGradeSourceType.Module,     true,  true],
      [AplusGradeSourceType.Module,     false, true],
      [AplusGradeSourceType.Module,     false, false],
      [AplusGradeSourceType.Difficulty, true,  true],
      [AplusGradeSourceType.Difficulty, true,  false],
      [AplusGradeSourceType.Difficulty, false, false],
    ];

    for (const [sourceType, withModuleId, withDifficulty] of invalid) {
      await responseTests
        .testBadRequest(url, cookies.adminCookie)
        .post([getGradeSource(sourceType, {withModuleId, withDifficulty})]);
    }
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url401 = `/v1/courses/${courseId}/aplus-source`;
    await responseTests
      .testUnauthorized(url401)
      .post([getFullPoints(), getModule(), getDifficulty()]);

    const url403 = `/v1/courses/${noRoleCourseId}/aplus-source`;
    await responseTests
      .testForbidden(url403, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post([getFullPoints(), getModule(), getDifficulty()]);
  });

  it('should respond with 404 when not found', async () => {
    const urlNoCourse = `/v1/courses/${nonExistentId}/aplus-source`;
    await responseTests
      .testNotFound(urlNoCourse, cookies.adminCookie)
      .post([getFullPoints(), getModule(), getDifficulty()]);

    const url = `/v1/courses/${courseId}/aplus-source`;
    await responseTests.testNotFound(url, cookies.adminCookie).post([
      getGradeSource(AplusGradeSourceType.FullPoints, {
        attainmentId: nonExistentId,
      }),
    ]);
  });

  it('should respond with 409 when an attainment does not belong to the course', async () => {
    const url = `/v1/courses/${courseId}/aplus-source`;
    await responseTests.testConflict(url, cookies.adminCookie).post([
      getGradeSource(AplusGradeSourceType.FullPoints, {
        attainmentId: differentCourseAttainmentId,
      }),
    ]);
  });
});

describe('Test GET /v1/courses/:courseId/aplus-fetch - Fetch grades from A+', () => {
  it('should fetch grades for full points (admin user)', async () => {
    const res = await request
      .get(
        `/v1/courses/${courseId}/aplus-fetch?attainments=[${fullPointsAttainmentId}]`
      )
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await NewGradeArraySchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should fetch grades for full points (teacher user)', async () => {
    const res = await request
      .get(
        `/v1/courses/${courseId}/aplus-fetch?attainments=[${fullPointsAttainmentId}]`
      )
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await NewGradeArraySchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should fetch grades for module', async () => {
    const res = await request
      .get(
        `/v1/courses/${courseId}/aplus-fetch?attainments=[${moduleAttainmentId}]`
      )
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await NewGradeArraySchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should fetch grades for difficulty', async () => {
    const res = await request
      .get(
        `/v1/courses/${courseId}/aplus-fetch?attainments=[${difficultyAttainmentId}]`
      )
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await NewGradeArraySchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should fetch grades for multiple attainments', async () => {
    const res = await request
      .get(
        `/v1/courses/${courseId}/aplus-fetch?attainments=[${fullPointsAttainmentId}, ${moduleAttainmentId}, ${difficultyAttainmentId}]`
      )
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await NewGradeArraySchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 if course ID is invalid', async () => {
    const url = `/v1/courses/abc/aplus-fetch?attainments=[${fullPointsAttainmentId}]`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
  });

  it('should respond with 400 if attainments list is invalid', async () => {
    const url = '/v1/courses/{courseId}/aplus-fetch';
    const invalid = [
      '?attainments=["abc"]',
      '?attainments=[abc]',
      '?attainments=5',
      '?attainments=["5"]',
      '?attainments',
      '?',
      '',
    ];
    for (const query of invalid) {
      await responseTests
        .testBadRequest(url + query, cookies.adminCookie)
        .get();
    }
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url401 = `/v1/courses/${courseId}/aplus-fetch`;
    await responseTests.testUnauthorized(url401).get();

    const url403 = `/v1/courses/${noRoleCourseId}/aplus-fetch`;
    await responseTests
      .testForbidden(url403, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .get();
  });

  it('should respond with 404 when not found', async () => {
    const urlNoCourse = `/v1/courses/${nonExistentId}/aplus-fetch?attainments=[${fullPointsAttainmentId}]`;
    await responseTests.testNotFound(urlNoCourse, cookies.adminCookie).get();

    const urlNoAttainment = `/v1/courses/${courseId}/aplus-fetch?attainments=[${nonExistentId}]`;
    await responseTests
      .testNotFound(urlNoAttainment, cookies.adminCookie)
      .get();
  });

  it('should respond with 409 when an attainment does not belong to the course', async () => {
    const url = `/v1/courses/${courseId}/aplus-fetch?attainments=[${differentCourseAttainmentId}]`;
    await responseTests.testConflict(url, cookies.adminCookie).get();
  });

  it('should respond with 422 if an attainment has no grade source', async () => {
    const url = `/v1/courses/${courseId}/aplus-fetch?attainments=[${noGradeSourceAttainmentId}]`;
    await responseTests.testUnprocessableEntity(url, cookies.adminCookie).get();
  });

  it('should respond with 502 if A+ request fails', async () => {
    mockedAxios.get.mockImplementationOnce(_url => {
      throw new AxiosError();
    });

    const url = `/v1/courses/${courseId}/aplus-fetch?attainments=[${fullPointsAttainmentId}]`;
    await responseTests.testBadGateway(url, cookies.adminCookie).get();
  });
});
