// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CookieAccessInfo} from 'cookiejar';
import * as fs from 'fs';
import mockdate from 'mockdate';
import supertest from 'supertest';

import {
  AuthDataSchema,
  HttpCode,
  LoginResultSchema,
  ResetPasswordResponseSchema,
  UserData,
} from '@/common/types';
import {app} from '../../src/app';
import {
  JWT_COOKIE_EXPIRY_MS,
  JWT_EXPIRY_SECONDS,
} from '../../src/configs/constants';
import {createData} from '../util/createData';
import {Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

const testLogin = async (
  email: string,
  password: string,
  forcePasswordReset: boolean = false
): Promise<void> => {
  const res = await request
    .post('/v1/auth/login')
    .send({email, password})
    .expect('Content-Type', /json/)
    .expect(HttpCode.Ok);

  const result = LoginResultSchema.safeParse(res.body);
  expect(result.success).toBeTruthy();
  if (result.success) {
    expect(result.data.resetPassword).toEqual(forcePasswordReset);
  }
};

let cookies: Cookies = {} as Cookies;

beforeAll(async () => {
  cookies = await getCookies();
});

afterAll(async () => {
  await resetDb();
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('fs', () => ({__esModule: true, ...jest.requireActual('fs')}));

describe('Test GET /v1/auth/self-info - fetch own info', () => {
  it('should act differently when user is logged in or out', async () => {
    // Use the agent for cookie persistence
    const agent = supertest.agent(app);
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Unauthorized);
    await agent
      .post('/v1/auth/login')
      .withCredentials(true)
      .send({email: 'admin@aalto.fi', password: 'password'})
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok)
      .expect('set-cookie', /jwt=/)
      .expect('set-cookie', /httponly/i);

    const res = await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Ok);
    await agent
      .post('/v1/auth/logout')
      .withCredentials(true)
      .send({})
      .expect(HttpCode.Ok);
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Unauthorized);

    const result = AuthDataSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
  });
});

describe('Test POST /v1/auth/login - log in with an existing user', () => {
  it('should log in', async () => {
    await testLogin('admin@aalto.fi', 'password');
  });

  it('should force reset password if necessary', async () => {
    const user = await createData.createAuthUser({
      forcePasswordReset: true,
    });
    await testLogin(user.email as string, 'password', true);
  });

  it('should respond with 401 when logging in with invalid credentials', async () => {
    const badCreds = responseTests.testUnauthorized(
      '/v1/auth/login',
      '{"errors":["Incorrect email or password"]}'
    );

    await badCreds.post({email: 'admin', password: 'password'});
    await badCreds.post({email: 'aalto.fi', password: 'password'});
    await badCreds.post({email: 'admin@aalto.fi', password: ''});
    await badCreds.post({email: 'admin@aalto.fi', password: 'password '});
  });
});

describe('Test POST /v1/auth/login and expiry', () => {
  it('should expire the session after a set time', async () => {
    // Use the agent for cookie persistence
    const agent = supertest.agent(app);
    const realDate = new Date();
    await agent
      .post('/v1/auth/login')
      .withCredentials(true)
      .send({email: 'admin@aalto.fi', password: 'password'})
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok);
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Ok);
    const jwt = agent.jar.getCookie('jwt', CookieAccessInfo.All);
    if (!jwt) throw new Error('jwt not available');

    // Simulate situtation where the browser does not properly expire the cookie
    mockdate.set(
      realDate.setMilliseconds(
        realDate.getMilliseconds() + JWT_COOKIE_EXPIRY_MS + 1
      )
    );
    // eslint-disable-next-line camelcase
    jwt.expiration_date = realDate.setSeconds(
      realDate.getSeconds() + JWT_EXPIRY_SECONDS * 2
    );
    agent.jar.setCookie(jwt);
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Ok);
    mockdate.set(
      realDate.setSeconds(realDate.getSeconds() + JWT_EXPIRY_SECONDS + 1)
    );
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Unauthorized);
  });
});

describe('Test POST /v1/auth/reset-password - reset own password', () => {
  it('should reset own password', async () => {
    const user = await createData.createAuthUser();
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';

    const res = await request
      .post('/v1/auth/reset-password')
      .send({email: user.email, password: 'password', newPassword: newPassword})
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok);

    const result = AuthDataSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();

    await testLogin(user.email as string, newPassword);
  });

  it('should respond with 400 if too weak password', async () => {
    const user = await createData.createAuthUser();
    const newPassword = 'weak';

    const data = {email: user.email, password: 'password', newPassword};
    await responseTests
      .testBadRequest('/v1/auth/reset-password', null)
      .post(data);

    await testLogin(user.email as string, 'password');
  });

  it('should respond with 400 if same password', async () => {
    const password = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';
    const user = await createData.createAuthUser({password});

    const data = {email: user.email, password, newPassword: password};
    await responseTests
      .testBadRequest('/v1/auth/reset-password', null)
      .post(data);

    await testLogin(user.email as string, password);
  });

  it('should respond with 401 when wrong password', async () => {
    const user = await createData.createAuthUser();
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';

    const data = {email: user.email, password: 'wrong', newPassword};
    await responseTests
      .testUnauthorized(
        '/v1/auth/reset-password',
        '{"errors":["Incorrect email or password"]}'
      )
      .post(data);

    await testLogin(user.email as string, 'password');
  });
});

describe("Test POST /v1/auth/reset-password/:userId - reset other admin's password", () => {
  // Broken if cookies are not refetched for some reason :/
  beforeAll(async () => {
    cookies = await getCookies();
  });

  it("Should reset other admin's password", async () => {
    const user = await createData.createAuthUser();

    const res = await request
      .post(`/v1/auth/reset-password/${user.id}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = ResetPasswordResponseSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
    if (result.success)
      await testLogin(
        user.email as string,
        result.data.temporaryPassword,
        true
      );
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const user = await createData.createAuthUser();
    const url = `/v1/auth/reset-password/${user.id}`;

    await responseTests.testUnauthorized(url).post({});

    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
      .post({});
  });
});

describe('Test POST /v1/auth/change-password - change own password', () => {
  const createUser = async (): Promise<[UserData, string[]]> => {
    const user = await createData.createAuthUser();
    const userRes = await request
      .post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({email: user.email, password: 'password'});
    const cookie = [userRes.headers['set-cookie']];
    return [user, cookie];
  };

  it('Should reset own password', async () => {
    const [user, cookie] = await createUser();
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';

    const res = await request
      .post('/v1/auth/change-password')
      .send({newPassword})
      .set('Cookie', cookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');

    await testLogin(user.email as string, newPassword);
  });

  it('should respond with 400 if new password is too weak', async () => {
    const [, cookie] = await createUser();
    const newPassword = 'weak';

    await responseTests
      .testBadRequest('/v1/auth/change-password', cookie)
      .post({newPassword});
  });

  it('should respond with 401 authorized', async () => {
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';
    await responseTests
      .testUnauthorized('/v1/auth/change-password')
      .post({newPassword});
  });
});

describe('Test GET /v1/auth/login-idp - check redirect', () => {
  it('should redirect to idp', async () => {
    const res = await request.get('/v1/auth/login-idp');
    expect(res.headers.location).toContain('idp.aalto');
  });
});

describe('Test GET /v1/auth/saml/metadata - check metadata file exists', () => {
  it('should get a metadata file', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => 'mock');

    const res = await request.get('/v1/auth/saml/metadata');
    expect(res.headers['content-type']).toContain('application/xml');
    expect(res.text).toContain('X509Certificate');
  });
});
