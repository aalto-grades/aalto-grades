// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import axios, {AxiosStatic} from 'axios';
import supertest from 'supertest';

import {
  AttainmentData,
  AplusAttainmentData,
  AplusExerciseDataSchema,
  AplusGradeSource,
  HttpCode,
} from '@common/types';
import {app} from '../../src/app';
import AplusAttainment from '../../src/database/models/aplusAttainment';
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
  const getAplusAttainment = (
    gradeSource: AplusGradeSource,
    {withModuleId = false, withDifficulty = false}
  ): AplusAttainmentData => ({
    attainmentId: attainments[0].id,
    aplusCourseId: 1,
    gradeSource: gradeSource,
    moduleId: withModuleId ? 1 : undefined,
    difficulty: withDifficulty ? 'A' : undefined,
  });

  const getFullPoints = (): AplusAttainmentData =>
    getAplusAttainment(AplusGradeSource.FullPoints, {});

  const getModule = (): AplusAttainmentData =>
    getAplusAttainment(AplusGradeSource.Module, {withModuleId: true});

  const getDifficulty = (): AplusAttainmentData =>
    getAplusAttainment(AplusGradeSource.Difficulty, {withDifficulty: true});

  const checkAplusAttainment = async (
    aplusAttainment: AplusAttainmentData
  ): Promise<void> => {
    const result = await AplusAttainment.findOne({
      // TODO: Remove
      // @ts-ignore
      where: {
        attainmentId: aplusAttainment.attainmentId,
        aplusCourseId: aplusAttainment.aplusCourseId,
        gradeSource: aplusAttainment.gradeSource,
        moduleId: aplusAttainment.moduleId ?? null,
        difficulty: aplusAttainment.difficulty ?? null,
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
    await checkAplusAttainment(getFullPoints());
    await checkAplusAttainment(getModule());
    await checkAplusAttainment(getDifficulty());
  });

  it('should add sources (teacher user)', async () => {
    const res = await request
      .post(`/v1/courses/${courseId}/aplus-source`)
      .send([getFullPoints(), getModule(), getDifficulty()])
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Created);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAplusAttainment(getFullPoints());
    await checkAplusAttainment(getModule());
    await checkAplusAttainment(getDifficulty());
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
      gradeSource: AplusGradeSource,
      withModuleId: boolean,
      withDifficulty: boolean
    ): Promise<void> => {
      await request
        .post(`/v1/courses/${courseId}/aplus-source`)
        .send([getAplusAttainment(gradeSource, {withModuleId, withDifficulty})])
        .set('Cookie', cookies.adminCookie)
        .expect(HttpCode.BadRequest);

      // TODO: Zod errors are not passed to the error handler?
      // const result = await ErrorSchema.safeParseAsync(res.body);
      // expect(result.success).toBeTruthy();
    };

    await testInvalid(AplusGradeSource.FullPoints, true, true);
    await testInvalid(AplusGradeSource.FullPoints, true, false);
    await testInvalid(AplusGradeSource.FullPoints, false, true);
    await testInvalid(AplusGradeSource.Module, true, true);
    await testInvalid(AplusGradeSource.Module, false, true);
    await testInvalid(AplusGradeSource.Module, false, false);
    await testInvalid(AplusGradeSource.Difficulty, true, true);
    await testInvalid(AplusGradeSource.Difficulty, true, false);
    await testInvalid(AplusGradeSource.Difficulty, false, false);
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
