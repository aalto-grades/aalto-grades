// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosError, AxiosStatic} from 'axios';
import supertest from 'supertest';

import {
  AplusCourseData,
  AplusCourseDataArraySchema,
  AplusExerciseDataSchema,
  AplusGradeSourceData,
  AplusGradeSourceType,
  CoursePartData,
  HttpCode,
  NewGradeArraySchema,
} from '@/common/types';
import {app} from '../../src/app';
import {APLUS_API_URL} from '../../src/configs/environment';
import AplusGradeSource from '../../src/database/models/aplusGradeSource';
import {createData} from '../util/createData';
import {TEACHER_ID} from '../util/general';
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
let fullPointsGradeSourceId = -1;
let moduleCoursePartId = -1;
let exerciseCoursePartId = -1;
let difficultyCoursePartId = -1;
let noRoleCourseId = -1;
let differentCoursePartId = -1;
let differentGradeSourceId = -1;

const nonExistentId = 1000000;

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

beforeAll(async () => {
  cookies = await getCookies();

  let courseParts: CoursePartData[];
  [courseId, courseParts] = await createData.createCourse({});
  [
    [fullPointsCoursePartId, fullPointsGradeSourceId],
    [moduleCoursePartId],
    [exerciseCoursePartId],
    [difficultyCoursePartId],
  ] = await createData.createAplusGradeSources(courseId);
  addGradeSourceCoursePartId = courseParts[0].id;
  noGradeSourceCoursePartId = courseParts[2].id;

  let otherCourseParts: CoursePartData[];
  [noRoleCourseId, otherCourseParts] = await createData.createCourse({
    hasTeacher: false,
    hasAssistant: false,
    hasStudent: false,
  });
  differentCoursePartId = otherCourseParts[0].id;
  let _ = -1;
  [[_, differentGradeSourceId]] =
    await createData.createAplusGradeSources(noRoleCourseId);

  // eslint-disable-next-line @typescript-eslint/require-await
  mockedAxios.get.mockImplementation(async url => {
    const urlPoints = `${APLUS_API_URL}/courses/1/points?format=json`;

    /* eslint-disable camelcase */
    if (url === urlPoints) {
      return {
        data: {
          results: [
            {
              student_id: '123456',
              points: 50,
              points_by_difficulty: {A: 30},
              modules: [
                {id: 1, points: 10, exercises: [{id: 1, points: 5}]},
                {id: 2, points: 40, exercises: []},
              ],
            },
            {
              student_id: '654321',
              points: 40,
              points_by_difficulty: {A: 25},
              modules: [
                {id: 1, points: 7, exercises: [{id: 1, points: 5}]},
                {id: 2, points: 33, exercises: []},
              ],
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

    const Schema = AplusCourseDataArraySchema.nonempty();
    const result = Schema.safeParse(res.body);
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
            closing_time: new Date(),
            exercises: [
              {id: 1, display_name: '1.1 First', difficulty: 'A'},
              {id: 2, display_name: '1.2 Second', difficulty: ''},
            ],
          },
          {
            id: 2,
            display_name: 'Second',
            closing_time: new Date(),
            exercises: [{id: 3, display_name: '2.1 Third', difficulty: ''}],
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

    const result = AplusExerciseDataSchema.safeParse(res.body);
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

describe('Test POST /v1/courses/:courseId/aplus-sources - add A+ grade sources', () => {
  type AplusGradeSourceAny = {
    coursePartId: number;
    aplusCourse: AplusCourseData;
    sourceType: AplusGradeSourceType;
    moduleId?: number;
    moduleName?: string;
    exerciseId?: number;
    exerciseName?: string;
    difficulty?: string;
  };

  const getGradeSource = (
    sourceType: AplusGradeSourceType,
    {
      withModuleId = false,
      withExerciseId = false,
      withDifficulty = false,
      coursePartId = addGradeSourceCoursePartId,
    }
  ): AplusGradeSourceAny => ({
    coursePartId,
    aplusCourse: {
      id: 1,
      courseCode: 'CS-789',
      name: 'The Name',
      instance: '1970',
      url: 'https://plus.cs.aalto.fi',
    },
    sourceType: sourceType,
    moduleId: withModuleId ? 1 : undefined,
    moduleName: withModuleId ? 'Module Name' : undefined,
    exerciseId: withExerciseId ? 1 : undefined,
    exerciseName: withExerciseId ? 'Exercise Name' : undefined,
    difficulty: withDifficulty ? 'A' : undefined,
  });

  const getFullPoints = (coursePartId?: number): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.FullPoints, {
      coursePartId,
    }) as AplusGradeSourceData;

  const getModule = (coursePartId?: number): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.Module, {
      withModuleId: true,
      coursePartId,
    }) as AplusGradeSourceData;

  const getExercise = (coursePartId?: number): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.Exercise, {
      withExerciseId: true,
      coursePartId,
    }) as AplusGradeSourceData;

  const getDifficulty = (coursePartId?: number): AplusGradeSourceData =>
    getGradeSource(AplusGradeSourceType.Difficulty, {
      withDifficulty: true,
      coursePartId,
    }) as AplusGradeSourceData;

  const checkAplusGradeSource = async (
    gradeSource: AplusGradeSourceData
  ): Promise<void> => {
    const sourceType = gradeSource.sourceType;
    const result = await AplusGradeSource.findOne({
      where: {
        coursePartId: gradeSource.coursePartId,
        aplusCourse: gradeSource.aplusCourse,
        sourceType: sourceType,
        moduleId:
          sourceType === AplusGradeSourceType.Module
            ? gradeSource.moduleId
            : null,
        moduleName:
          sourceType === AplusGradeSourceType.Module
            ? gradeSource.moduleName
            : null,
        exerciseId:
          sourceType === AplusGradeSourceType.Exercise
            ? gradeSource.exerciseId
            : null,
        exerciseName:
          sourceType === AplusGradeSourceType.Exercise
            ? gradeSource.exerciseName
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
      const coursePart = await createData.createCoursePart(courseId);
      const res = await request
        .post(`/v1/courses/${courseId}/aplus-sources`)
        .send([
          getFullPoints(coursePart.id),
          getModule(coursePart.id),
          getExercise(coursePart.id),
          getDifficulty(coursePart.id),
        ])
        .set('Cookie', cookie)
        .expect(HttpCode.Created);

      expect(JSON.stringify(res.body)).toBe('{}');
      await checkAplusGradeSource(getFullPoints(coursePart.id));
      await checkAplusGradeSource(getModule(coursePart.id));
      await checkAplusGradeSource(getExercise(coursePart.id));
      await checkAplusGradeSource(getDifficulty(coursePart.id));
    }
  });

  it('should respond with 400 if course ID is invalid', async () => {
    const url = '/v1/courses/abc/aplus-sources';
    await responseTests
      .testBadRequest(url, cookies.adminCookie)
      .post([getFullPoints(), getModule(), getExercise(), getDifficulty()]);
  });

  it('should respond with 400 if input data is invalid', async () => {
    const url = `/v1/courses/${courseId}/aplus-sources`;

    // prettier-ignore
    const valid: [AplusGradeSourceType, boolean, boolean, boolean][] = [
      [AplusGradeSourceType.FullPoints, false, false, false],
      [AplusGradeSourceType.Module,     true,  false, false],
      [AplusGradeSourceType.Exercise,   false, true,  false],
      [AplusGradeSourceType.Difficulty, false, false, true],
    ];

    // Not very pretty but it works
    for (const sourceType of Object.values(AplusGradeSourceType)) {
      for (const withModuleId of [true, false]) {
        for (const withExerciseId of [true, false]) {
          for (const withDifficulty of [true, false]) {
            const format = [
              sourceType,
              withModuleId,
              withExerciseId,
              withDifficulty,
            ];

            if (!valid.find(v => v.every((_, i) => v[i] === format[i]))) {
              await responseTests
                .testBadRequest(url, cookies.adminCookie)
                .post([
                  getGradeSource(sourceType, {
                    withModuleId,
                    withExerciseId,
                    withDifficulty,
                  }),
                ]);
            }
          }
        }
      }
    }
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url401 = `/v1/courses/${courseId}/aplus-sources`;
    await responseTests
      .testUnauthorized(url401)
      .post([getFullPoints(), getModule(), getExercise(), getDifficulty()]);

    const url403 = `/v1/courses/${noRoleCourseId}/aplus-sources`;
    await responseTests
      .testForbidden(url403, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post([getFullPoints(), getModule(), getExercise(), getDifficulty()]);
  });

  it('should respond with 404 when not found', async () => {
    const urlNoCourse = `/v1/courses/${nonExistentId}/aplus-sources`;
    await responseTests
      .testNotFound(urlNoCourse, cookies.adminCookie)
      .post([getFullPoints(), getModule(), getExercise(), getDifficulty()]);

    const url = `/v1/courses/${courseId}/aplus-sources`;
    await responseTests.testNotFound(url, cookies.adminCookie).post([
      getGradeSource(AplusGradeSourceType.FullPoints, {
        coursePartId: nonExistentId,
      }),
    ]);
  });

  it('should respond with 409 when course part does not belong to the course', async () => {
    const url = `/v1/courses/${courseId}/aplus-sources`;
    await responseTests.testConflict(url, cookies.adminCookie).post([
      getGradeSource(AplusGradeSourceType.FullPoints, {
        coursePartId: differentCoursePartId,
      }),
    ]);
  });

  it('should respond with 409 when attempting to add the same grade source multiple time to the same course part', async () => {
    const url = `/v1/courses/${courseId}/aplus-sources`;
    const coursePart = await createData.createCoursePart(courseId);
    for (const get of [getFullPoints, getModule, getExercise, getDifficulty]) {
      const source = get(coursePart.id);

      // Adding the same grade source twice in the same request
      await responseTests
        .testConflict(url, cookies.adminCookie)
        .post([source, source]);

      // Adding the same grade source which already exists in the database
      await request
        .post(url)
        .send([source])
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.Created);

      await responseTests.testConflict(url, cookies.adminCookie).post([source]);
    }
  });
});

describe('Test DELETE /v1/courses/:courseId/aplus-sources/:aplusGradeSourceId - delete A+ grade source', () => {
  it('should delete an A+ grade source', async () => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const [[_, aplusGradeSourceId]] =
        await createData.createAplusGradeSources(courseId);
      expect(
        await AplusGradeSource.findByPk(aplusGradeSourceId)
      ).not.toBeNull();

      const res = await request
        .delete(`/v1/courses/${courseId}/aplus-sources/${aplusGradeSourceId}`)
        .set('Cookie', cookie)
        .expect(HttpCode.Ok);

      expect(JSON.stringify(res.body)).toBe('{}');
      expect(await AplusGradeSource.findByPk(aplusGradeSourceId)).toBeNull();
    }
  });

  it('should respond with 400 if an ID is invalid', async () => {
    const urlInvalidCourseId = `/v1/courses/invalid/aplus-sources/${fullPointsGradeSourceId}`;
    await responseTests
      .testBadRequest(urlInvalidCourseId, cookies.adminCookie)
      .delete();

    const urlInvalidGradeSourceId = `/v1/courses/${courseId}/aplus-sources/invalid`;
    await responseTests
      .testBadRequest(urlInvalidGradeSourceId, cookies.adminCookie)
      .delete();
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const url401 = `/v1/courses/${courseId}/aplus-sources/${fullPointsGradeSourceId}`;
    await responseTests.testUnauthorized(url401).delete();

    const url403 = `/v1/courses/${noRoleCourseId}/aplus-sources/${differentGradeSourceId}`;
    await responseTests
      .testForbidden(url403, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .delete();
  });

  it('should respond with 404 if not found', async () => {
    const urlNoCourse = `/v1/courses/${nonExistentId}/aplus-sources/${fullPointsGradeSourceId}`;
    await responseTests.testNotFound(urlNoCourse, cookies.adminCookie).delete();

    const urlNoGradeSource = `/v1/courses/${courseId}/aplus-sources/${nonExistentId}`;
    await responseTests
      .testNotFound(urlNoGradeSource, cookies.adminCookie)
      .delete();
  });

  it('should respond with 409 if A+ grade source does not belong to course', async () => {
    const url = `/v1/courses/${courseId}/aplus-sources/${differentGradeSourceId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });

  it('should respond with 409 if A+ grade source has grades', async () => {
    const [[_, aplusGradeSourceId]] =
      await createData.createAplusGradeSources(courseId);
    const user = await createData.createUser();
    await createData.createGrade(
      user.id,
      fullPointsCoursePartId,
      TEACHER_ID,
      5,
      new Date(),
      aplusGradeSourceId
    );

    const url = `/v1/courses/${courseId}/aplus-sources/${aplusGradeSourceId}`;
    await responseTests.testConflict(url, cookies.adminCookie).delete();
  });
});

describe('Test GET /v1/courses/:courseId/aplus-fetch - Fetch grades from A+', () => {
  const successTest = async (courseParts: number[]): Promise<void> => {
    const testCookies = [cookies.adminCookie, cookies.teacherCookie];
    for (const cookie of testCookies) {
      const res = await request
        .get(
          `/v1/courses/${courseId}/aplus-fetch?course-parts=${JSON.stringify(courseParts)}`
        )
        .set('Cookie', cookie)
        .set('Authorization', authorization)
        .set('Accept', 'application/json')
        .expect(HttpCode.Ok);

      const Schema = NewGradeArraySchema.nonempty();
      const result = Schema.safeParse(res.body);
      expect(result.success).toBeTruthy();
    }
  };

  it('should fetch grades for full points', async () => {
    await successTest([fullPointsCoursePartId]);
  });

  it('should fetch grades for module', async () => {
    await successTest([moduleCoursePartId]);
  });

  it('should fetch grades for exercise', async () => {
    await successTest([exerciseCoursePartId]);
  });

  it('should fetch grades for difficulty', async () => {
    await successTest([difficultyCoursePartId]);
  });

  it('should fetch grades for multiple course parts', async () => {
    await successTest([
      fullPointsCoursePartId,
      moduleCoursePartId,
      exerciseCoursePartId,
      difficultyCoursePartId,
    ]);
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
