// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosError, AxiosStatic} from 'axios';
import supertest from 'supertest';
import {z} from 'zod';

import {
  CoursePartData,
  AplusCourseDataSchema,
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

const authorization = 'Aplus-Token abcdefghijklmnopqrstuvwxyzabcdefghijklmn';
const invalidAuthorization = [
  'abcdefghijklmnopqrstuvwxyzabcdefghijklmn',
  'Aplus-Token',
  'Aplus-Token abcdefghijklmnopqrst',
  'Token abcdefghijklmnopqrstuvwxyzabcdefghijklmn',
  '',
];

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let addGradeSourceCoursePartId = -1;
let noGradeSourceCoursePartId = -1;
let fullPointsCoursePartId = -1;
let moduleCoursePartId = -1;
let difficultyCoursePartId = -1;
let noRoleCourseId = -1;
let differentCoursePartId = -1;

const nonExistentId = 1000000;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

beforeAll(async () => {
  cookies = await getCookies();

  let courseParts: CoursePartData[];
  [courseId, courseParts] = await createData.createCourse({});
  [fullPointsCoursePartId, moduleCoursePartId, difficultyCoursePartId] =
    await createData.createAplusGradeSources(courseId);
  addGradeSourceCoursePartId = courseParts[0].id;
  noGradeSourceCoursePartId = courseParts[2].id;

  let otherCourseParts: CoursePartData[];
  [noRoleCourseId, otherCourseParts] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  differentCoursePartId = otherCourseParts[0].id;

  // eslint-disable-next-line @typescript-eslint/require-await
  mockedAxios.get.mockImplementation(async url => {
    const urlPoints = `${APLUS_API_URL}/courses/1/points?format=json`;
    const urlA = `${APLUS_API_URL}/courses/1/points/1?format=json`;
    const urlB = `${APLUS_API_URL}/courses/1/points/2?format=json`;

    /* eslint-disable camelcase */
    switch (url) {
      case urlPoints:
        return {
          data: {results: [{points: urlA}, {points: urlB}]},
        };

      case urlA:
        return {
          data: {
            student_id: '123456',
            points: 50,
            points_by_difficulty: {A: 30},
            modules: [
              {id: 1, points: 10},
              {id: 2, points: 40},
            ],
          },
        };

      case urlB:
        return {
          data: {
            student_id: '654321',
            points: 40,
            points_by_difficulty: {A: 25},
            modules: [
              {id: 1, points: 7},
              {id: 2, points: 33},
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

describe('Test GET /v1/aplus/courses - get A+ courses', () => {
  it('should respond with correct data', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      /* eslint-disable camelcase */
      data: {
        staff_courses: [
          {
            id: 1,
            code: 'CS-ABC',
            name: 'Course 1',
            instance_name: '2024',
            html_url: 'https://plus.cs.aalto.fi',
          },
          {
            id: 2,
            code: 'ELEC-XYZ',
            name: 'Course 2',
            instance_name: '2025',
            html_url: 'https://plus.cs.aalto.fi',
          },
        ],
      },
      /* eslint-enable camelcase */
    });

    const res = await request
      .get('/v1/aplus/courses')
      .set('Cookie', cookies.adminCookie)
      .set('Authorization', authorization)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(AplusCourseDataSchema);
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 if A+ token parsing fails', async () => {
    const url = '/v1/aplus/courses';
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
    for (const invalid of invalidAuthorization) {
      await responseTests
        .testBadRequest(url, cookies.adminCookie)
        .set('Authorization', invalid)
        .get();
    }
  });

  it('should respond with 401 if not logged in', async () => {
    const url = '/v1/aplus/courses';
    await responseTests.testUnauthorized(url).get();
  });

  it('should respond with 404 when not found', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        staff_courses: [], // eslint-disable-line camelcase
      },
    });

    const url = '/v1/aplus/courses';
    await responseTests
      .testNotFound(url, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();
  });

  it('should respond with 502 if A+ request fails', async () => {
    mockedAxios.get.mockImplementationOnce(() => {
      throw new AxiosError();
    });

    const url = '/v1/aplus/courses';
    await responseTests
      .testBadGateway(url, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();
  });
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
      .set('Authorization', authorization)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await AplusExerciseDataSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 if validation fails (non-number A+ course ID)', async () => {
    const url = '/v1/aplus/courses/abc';
    await responseTests
      .testBadRequest(url, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();
  });

  it('should respond with 400 if A+ token parsing fails', async () => {
    const url = '/v1/aplus/courses/1';
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
    for (const invalid of invalidAuthorization) {
      await responseTests
        .testBadRequest(url, cookies.adminCookie)
        .set('Authorization', invalid)
        .get();
    }
  });

  it('should respond with 401 if not logged in', async () => {
    const url = '/v1/aplus/courses/1';
    await responseTests.testUnauthorized(url).get();
  });

  it('should respond with 502 if A+ request fails', async () => {
    mockedAxios.get.mockImplementationOnce(() => {
      throw new AxiosError();
    });

    const url = '/v1/aplus/courses/1';
    await responseTests
      .testBadGateway(url, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();
  });
});

describe('Test POST /v1/courses/:courseId/aplus-source - add A+ grade sources', () => {
  type AplusGradeSourceAny = {
    coursePartId: number;
    aplusCourseId: number;
    sourceType: AplusGradeSourceType;
    moduleId?: number;
    difficulty?: string;
  };

  const getGradeSource = (
    sourceType: AplusGradeSourceType,
    {
      withModuleId = false,
      withDifficulty = false,
      coursePartId = addGradeSourceCoursePartId,
    }
  ): AplusGradeSourceAny => ({
    coursePartId,
    aplusCourseId: 1,
    sourceType: sourceType,
    moduleId: withModuleId ? 1 : undefined,
    difficulty: withDifficulty ? 'A' : undefined,
  });

  const getFullPoints = (): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.FullPoints, {}) as AplusGradeSourceData;

  const getModule = (): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.Module, {
      withModuleId: true,
    }) as AplusGradeSourceData;

  const getDifficulty = (): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.Difficulty, {
      withDifficulty: true,
    }) as AplusGradeSourceData;

  const checkAplusGradeSource = async (
    gradeSource: AplusGradeSourceData
  ): Promise<void> => {
    const sourceType = gradeSource.sourceType;
    const result = await AplusGradeSource.findOne({
      where: {
        coursePartId: gradeSource.coursePartId,
        aplusCourseId: gradeSource.aplusCourseId,
        sourceType: sourceType,
        moduleId:
          sourceType === AplusGradeSourceType.Module
            ? gradeSource.moduleId
            : null,
        difficulty:
          sourceType === AplusGradeSourceType.Difficulty
            ? gradeSource.difficulty
            : null,
      },
    });

    expect(result).not.toBe(null);
  };

  it('should add sources', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const res = await request
        .post(`/v1/courses/${courseId}/aplus-source`)
        .send([getFullPoints(), getModule(), getDifficulty()])
        .set('Cookie', cookie)
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkAplusGradeSource(getFullPoints());
      await checkAplusGradeSource(getModule());
      await checkAplusGradeSource(getDifficulty());
    }
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
        coursePartId: nonExistentId,
      }),
    ]);
  });

  it('should respond with 409 when course part does not belong to the course', async () => {
    const url = `/v1/courses/${courseId}/aplus-source`;
    await responseTests.testConflict(url, cookies.adminCookie).post([
      getGradeSource(AplusGradeSourceType.FullPoints, {
        coursePartId: differentCoursePartId,
      }),
    ]);
  });
});

describe('Test GET /v1/courses/:courseId/aplus-fetch - Fetch grades from A+', () => {
  it('should fetch grades for full points', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const res = await request
        .get(
          `/v1/courses/${courseId}/aplus-fetch?course-parts=[${fullPointsCoursePartId}]`
        )
        .set('Cookie', cookie)
        .set('Authorization', authorization)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = await NewGradeArraySchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should fetch grades for module', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const res = await request
        .get(
          `/v1/courses/${courseId}/aplus-fetch?course-parts=[${moduleCoursePartId}]`
        )
        .set('Cookie', cookie)
        .set('Authorization', authorization)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = await NewGradeArraySchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should fetch grades for difficulty', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const res = await request
        .get(
          `/v1/courses/${courseId}/aplus-fetch?course-parts=[${difficultyCoursePartId}]`
        )
        .set('Cookie', cookie)
        .set('Authorization', authorization)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = await NewGradeArraySchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should fetch grades for multiple course parts', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const res = await request
        .get(
          `/v1/courses/${courseId}/aplus-fetch?course-parts=[${fullPointsCoursePartId}, ${moduleCoursePartId}, ${difficultyCoursePartId}]`
        )
        .set('Cookie', cookie)
        .set('Authorization', authorization)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const result = await NewGradeArraySchema.safeParseAsync(res.body);
      expect(result.success).toBeTruthy();
    }
  });

  it('should respond with 400 if A+ token parsing fails', async () => {
    const url = `/v1/courses/${courseId}/aplus-fetch?course-parts=[${fullPointsCoursePartId}]`;
    await responseTests.testBadRequest(url, cookies.adminCookie).get();
    for (const invalid of invalidAuthorization) {
      await responseTests
        .testBadRequest(url, cookies.adminCookie)
        .set('Authorization', invalid)
        .get();
    }
  });

  it('should respond with 400 if course ID is invalid', async () => {
    const url = `/v1/courses/abc/aplus-fetch?course-parts=[${fullPointsCoursePartId}]`;
    await responseTests
      .testBadRequest(url, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();
  });

  it('should respond with 400 if course part list is invalid', async () => {
    const url = '/v1/courses/{courseId}/aplus-fetch';
    const invalid = [
      '?course-parts=["abc"]',
      '?course-parts=[abc]',
      '?course-parts=5',
      '?course-parts=["5"]',
      '?course-parts',
      '?',
      '',
    ];
    for (const query of invalid) {
      await responseTests
        .testBadRequest(url + query, cookies.adminCookie)
        .set('Authorization', authorization)
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
    const urlNoCourse = `/v1/courses/${nonExistentId}/aplus-fetch?course-parts=[${fullPointsCoursePartId}]`;
    await responseTests
      .testNotFound(urlNoCourse, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();

    const urlNoCoursePart = `/v1/courses/${courseId}/aplus-fetch?course-parts=[${nonExistentId}]`;
    await responseTests
      .testNotFound(urlNoCoursePart, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();

    const urlNoGradeSource = `/v1/courses/${courseId}/aplus-fetch?course-parts=[${noGradeSourceCoursePartId}]`;
    await responseTests
      .testNotFound(urlNoGradeSource, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();
  });

  it('should respond with 409 when course part does not belong to the course', async () => {
    const url = `/v1/courses/${courseId}/aplus-fetch?course-parts=[${differentCoursePartId}]`;
    await responseTests
      .testConflict(url, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();
  });

  it('should respond with 502 if A+ request fails', async () => {
    mockedAxios.get.mockImplementationOnce(() => {
      throw new AxiosError();
    });

    const url = `/v1/courses/${courseId}/aplus-fetch?course-parts=[${fullPointsCoursePartId}]`;
    await responseTests
      .testBadGateway(url, cookies.adminCookie)
      .set('Authorization', authorization)
      .get();
  });
});
