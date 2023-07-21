// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { HttpCode } from 'aalto-grades-common/types';
import supertest from 'supertest';

import { app } from '../../src/app';
import { getCookies, Cookies } from '../util/getCookies';

const request: supertest.SuperTest<supertest.Test> = supertest(app);
let res: supertest.Response;
let cookies: Cookies = {
  adminCookie: [],
  userCookie: []
};

beforeAll(async () => {
  cookies = await getCookies();
});

describe('Test GET /v1/formulas - get grading formula info', () => {

  it('should get all available grading formulas', async () => {
    res = await request
      .get('/v1/formulas')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.formulas).toBeDefined();
    expect(res.body.data.formulas[0].id).toBeDefined();
    expect(res.body.data.formulas[0].name).toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/formulas')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

});

describe('Test GET /v1/formulas/:formulaId - get detailed formula info', () => {

  it('should get detailed info on WEIGHTED_AVERAGE formula', async () => {
    res = await request
      .get('/v1/formulas/WEIGHTED_AVERAGE')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(res.body.success).toBeTruthy();
    expect(res.body.errors).not.toBeDefined();
    expect(res.body.data.formula).toBeDefined();
    expect(res.body.data.formula.id).toBeDefined();
    expect(res.body.data.formula.name).toBeDefined();
    expect(res.body.data.formula.params).toBeDefined();
    expect(res.body.data.formula.childParams).toBeDefined();
    expect(res.body.data.formula.codeSnippet).toBeDefined();
  });

  it('should respond with 400 bad input if the formula enum incorrect', async () => {
    res = await request
      .get('/v1/formulas/abc')
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.BadRequest);

    expect(res.body.success).toBeFalsy();
    expect(res.body.errors).toBeDefined();
    expect(res.body.data).not.toBeDefined();
  });

  it('should respond with 401 unauthorized, if not logged in', async () => {
    await request
      .get('/v1/formulas/WEIGHTED_AVERAGE')
      .set('Accept', 'application/json')
      .expect(HttpCode.Unauthorized);
  });

});
