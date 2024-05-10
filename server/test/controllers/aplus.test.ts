// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosStatic} from 'axios';
import supertest from 'supertest';

import {
  AttainmentData,
  AplusExerciseDataSchema,
  AplusGradeSourceData,
  AplusGradeSourceType,
  HttpCode,
} from '@common/types';
import {app} from '../../src/app';
import AplusGradeSource from '../../src/database/models/aplusGradeSource';
import {createData} from '../util/createData';
import {ErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';

const request = supertest(app);

let cookies: Cookies = {} as Cookies;
let courseId = -1;
let attainments: AttainmentData[] = [];

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<AxiosStatic>;

beforeAll(async () => {
  cookies = await getCookies();

  let _;
  [courseId, attainments, _] = await createData.createCourse({});
});

afterAll(async () => {
  await resetDb();
});

describe('Test GET /v1/aplus/courses/:aplusCourseId - get A+ exercise data', () => {
  it('should respond with correct data when validation passes', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 1,
            display_name: 'First', // eslint-disable-line camelcase
            exercises: [{difficulty: 'A'}, {difficulty: ''}],
          },
          {
            id: 2,
            display_name: 'Second', // eslint-disable-line camelcase
            exercises: [{difficulty: ''}],
          },
        ],
      },
    });

    const res = await request
      .get('/v1/aplus/courses/1')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = await AplusExerciseDataSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if validation fails (non-number A+ course ID)', async () => {
    const res = await request
      .get('/v1/aplus/courses/abc')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .get('/v1/aplus/courses/1')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });
});

describe('Test POST /v1/courses/:courseId/aplus-source - add A+ grade sources', () => {
  const getGradeSource = (
    sourceType: AplusGradeSourceType,
    {withModuleId = false, withDifficulty = false}
  ): AplusGradeSourceData => ({
    attainmentId: attainments[0].id,
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

  it('should respond with 400 bad request, if course ID is invalid', async () => {
    const res = await request
      .post('/v1/courses/abc/aplus-source')
      .send([getFullPoints(), getModule(), getDifficulty()])
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.BadRequest);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if input data is invalid', async () => {
    const testInvalid = async (
      sourceType: AplusGradeSourceType,
      withModuleId: boolean,
      withDifficulty: boolean
    ): Promise<void> => {
      await request
        .post(`/v1/courses/${courseId}/aplus-source`)
        .send([getGradeSource(sourceType, {withModuleId, withDifficulty})])
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.BadRequest);

      // TODO: Zod errors are not passed to the error handler?
      // const result = await ErrorSchema.safeParseAsync(res.body);
      // expect(result.success).toBeTruthy();
    };

    await testInvalid(AplusGradeSourceType.FullPoints, true, true);
    await testInvalid(AplusGradeSourceType.FullPoints, true, false);
    await testInvalid(AplusGradeSourceType.FullPoints, false, true);
    await testInvalid(AplusGradeSourceType.Module, true, true);
    await testInvalid(AplusGradeSourceType.Module, false, true);
    await testInvalid(AplusGradeSourceType.Module, false, false);
    await testInvalid(AplusGradeSourceType.Difficulty, true, true);
    await testInvalid(AplusGradeSourceType.Difficulty, true, false);
    await testInvalid(AplusGradeSourceType.Difficulty, false, false);
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/aplus-source`)
      .send([getFullPoints(), getModule(), getDifficulty()])
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    // TODO
  });
});

describe('Test POST /v1/courses/:courseId/attainments/:attainmentId/aplus-fetch - Fetch grades from A+', () => {
  it('should fetch grades for full points (admin user)', async () => {
    // TODO
  });

  it('should fetch grades for full points (teacher user)', async () => {
    // TODO
  });

  it('should fetch grades for module', async () => {
    // TODO
  });

  it('should fetch grades for difficulty', async () => {
    // TODO
  });
});
