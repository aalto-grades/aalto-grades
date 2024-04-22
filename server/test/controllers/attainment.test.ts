// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';
import {z} from 'zod';

import {
  AttainmentDataSchema,
  HttpCode,
  IdSchema,
  NewAttainmentData,
} from '@common/types';
import {app} from '../../src/app';
import Attainment from '../../src/database/models/attainment';
import {ErrorSchema} from '../util/general';
import {Cookies, getCookies} from '../util/getCookies';

const request = supertest(app);
let cookies: Cookies = {
  adminCookie: [],
  teacherCookie: [],
};

const testCourseId = 11;
const testCourse2Id = 6; // Not teacher in charge
const editAttainmentId = 41;
const course2AttainmentId = 26;
const badId = 1000000;

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test GET /v1/courses/:courseId/attainments - get attainments', () => {
  it('should get the attainments succesfully (admin user)', async () => {
    const res = await request
      .get(`/v1/courses/${testCourseId}/attainments`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(AttainmentDataSchema.strict()).nonempty();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should get the attainments succesfully (teacher in charge)', async () => {
    const res = await request
      .get(`/v1/courses/${testCourseId}/attainments`)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const Schema = z.array(AttainmentDataSchema.strict()).nonempty();
    const result = await Schema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 400 bad request, if course ID is invalid', async () => {
    const res = await request
      .get('/v1/courses/bad/attainments')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .get(`/v1/courses/${testCourseId}/attainments`)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  // it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
  //   const res = await request
  //     .get(`/v1/courses/${testCourse2Id}/attainments`)
  //     .set('Cookie', cookies.teacherCookie)
  //     .set('Accept', 'application/json')
  //     .expect(HttpCode.Forbidden);

  //   const result = await ErrorSchema.safeParseAsync(res.body);
  //   expect(result.success).toBeTruthy();
  // });

  it('should respond with 404 not found, if course does not exist', async () => {
    const res = await request
      .get(`/v1/courses/${badId}/attainments`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.NotFound);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test POST /v1/courses/:courseId/attainments - add an attainment', () => {
  const checkAttainment = async (
    id: number,
    attainment: NewAttainmentData
  ): Promise<void> => {
    const result = await Attainment.findOne({
      where: {id, courseId: testCourseId},
    });

    expect(result).not.toBe(null);
    expect(result?.name).toBe(attainment.name);
    expect(result?.daysValid).toBe(attainment.daysValid);
  };

  it('should add new attainment (admin user)', async () => {
    const attainment = {name: 'test1', daysValid: 350};
    const res = await request
      .post(`/v1/courses/${testCourseId}/attainments`)
      .send(attainment)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const result = await IdSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
    if (result.success) await checkAttainment(result.data, attainment);
  });

  it('should add new attainment (teacher in charge)', async () => {
    const attainment = {name: 'test2', daysValid: 340};
    const res = await request
      .post(`/v1/courses/${testCourseId}/attainments`)
      .send(attainment)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Created);

    const result = await IdSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
    if (result.success) await checkAttainment(result.data, attainment);
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const attainment = {name: 'not added', daysValid: 330};
    const res = await request
      .post(`/v1/courses/${testCourseId}/attainments`)
      .send(attainment)
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const attainment = {name: 'not added', daysValid: 320};
    const res = await request
      .post(`/v1/courses/${testCourse2Id}/attainments`)
      .send(attainment)
      .set('Cookie', cookies.teacherCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test PUT /v1/courses/:courseId/attainments/:attainmentId - edit an attainment', () => {
  const checkAttainment = async (
    attainment: NewAttainmentData
  ): Promise<void> => {
    const result = await Attainment.findOne({
      where: {id: editAttainmentId, courseId: testCourseId},
    });

    expect(result).not.toBe(null);
    expect(result?.name).toBe(attainment.name);
    expect(result?.daysValid).toBe(attainment.daysValid);
  };

  it('should edit attainment (admin user)', async () => {
    const attainment = {name: 'edit1', daysValid: 100};
    const res = await request
      .put(`/v1/courses/${testCourseId}/attainments/${editAttainmentId}`)
      .send(attainment)
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAttainment(attainment);
  });

  it('should edit only attainment name (admin user)', async () => {
    const attainment = {name: 'edit1 new'};
    const res = await request
      .put(`/v1/courses/${testCourseId}/attainments/${editAttainmentId}`)
      .send(attainment)
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAttainment({name: 'edit1 new', daysValid: 100});
  });

  it('should edit only attainment daysValid (admin user)', async () => {
    const attainment = {daysValid: 80};
    const res = await request
      .put(`/v1/courses/${testCourseId}/attainments/${editAttainmentId}`)
      .send(attainment)
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAttainment({name: 'edit1 new', daysValid: 80});
  });

  it('should edit attainment (teacher in charge)', async () => {
    const attainment = {name: 'edit2', daysValid: 50};
    const res = await request
      .put(`/v1/courses/${testCourseId}/attainments/${editAttainmentId}`)
      .send(attainment)
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAttainment(attainment);
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const attainment = {name: 'not edited', daysValid: 20};
    const res = await request
      .put(`/v1/courses/${testCourseId}/attainments/${editAttainmentId}`)
      .send(attainment)
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const attainment = {name: 'not edited', daysValid: 20};
    const res = await request
      .put(`/v1/courses/${testCourse2Id}/attainments/${course2AttainmentId}`)
      .send(attainment)
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test Delete /v1/courses/:courseId/attainments/:attainmentId - delete an attainment', () => {
  const checkAttainment = async (id: number): Promise<void> => {
    const result = await Attainment.findOne({
      where: {id: id, courseId: testCourseId},
    });
    expect(result).toBeNull();
  };

  it('should delete attainment (admin user)', async () => {
    const res = await request
      .delete(`/v1/courses/${testCourseId}/attainments/${editAttainmentId}`)
      .set('Cookie', cookies.adminCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAttainment(editAttainmentId);
  });

  it('should edit attainment (teacher in charge)', async () => {
    const res = await request
      .delete(`/v1/courses/${testCourseId}/attainments/${editAttainmentId + 1}`)
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');
    await checkAttainment(editAttainmentId + 1);
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    const res = await request
      .delete(`/v1/courses/${testCourseId}/attainments/${editAttainmentId + 2}`)
      .expect(HttpCode.Unauthorized);

    expect(JSON.stringify(res.body)).toBe('{}');
  });

  it('should respond with 403 forbidden if user not admin or teacher in charge', async () => {
    const res = await request
      .delete(
        `/v1/courses/${testCourse2Id}/attainments/${course2AttainmentId + 1}`
      )
      .set('Cookie', cookies.teacherCookie)
      .expect(HttpCode.Forbidden);

    const result = await ErrorSchema.safeParseAsync(res.body);
    expect(result.success).toBeTruthy();
  });
});
