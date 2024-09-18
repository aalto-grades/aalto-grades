// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CookieAccessInfo} from 'cookiejar';
import * as fs from 'fs';
import mockdate from 'mockdate';
import {authenticator} from 'otplib';
import supertest from 'supertest';

import {
  AuthDataSchema,
  ChangeOwnAuthResponseSchema,
  HttpCode,
  type LoginResult,
  LoginResultSchema,
  ResetAuthResultSchema,
  type UserData,
} from '@/common/types';
import {app} from '../../src/app';
import {
  JWT_COOKIE_EXPIRY_MS,
  JWT_EXPIRY_SECONDS,
} from '../../src/configs/constants';
import User from '../../src/database/models/user';
import {createData} from '../util/createData';
import {type Cookies, getCookies} from '../util/getCookies';
import {resetDb} from '../util/resetDb';
import {ResponseTests} from '../util/responses';

const request = supertest(app);
const responseTests = new ResponseTests(request);

let cookies: Cookies = {} as Cookies;

beforeAll(async () => {
  cookies = await getCookies();
});

afterAll(async () => {
  await resetDb();
});

// Required to fix saml test?
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('fs', () => ({__esModule: true, ...jest.requireActual('fs')}));

const getToken = async (userId: number): Promise<string> => {
  const dbUser = await User.findByPk(userId);
  const secret = dbUser?.mfaSecret as string;
  return authenticator.generate(secret);
};

const testLogin = async (
  email: string,
  password: string,
  userId?: number,
  otp: string | null = null
): Promise<LoginResult> => {
  let otpToken = otp;
  if (userId !== undefined) otpToken = await getToken(userId);

  const res = await request
    .post('/v1/auth/login')
    .send({email, password, otp: otpToken})
    .expect('Content-Type', /json/)
    .expect(HttpCode.Ok);

  const result = LoginResultSchema.safeParse(res.body);
  expect(result.success).toBeTruthy();
  return result.data as LoginResult;
};

describe('Test GET /v1/auth/self-info - fetch own info', () => {
  it('should act differently when user is logged in or out', async () => {
    // Use the agent for cookie persistence
    const agent = supertest.agent(app);
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Unauthorized);
    const token = await getToken(1);
    await agent
      .post('/v1/auth/login')
      .withCredentials(true)
      .send({email: 'admin@aalto.fi', password: 'password', otp: token})
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
    const result = await testLogin('admin@aalto.fi', 'password', 1);
    expect(result.status).toBe('ok');
  });

  it('should force reset password if necessary', async () => {
    const secret = authenticator.generateSecret(64);
    const user = await createData.createAuthUser({
      forcePasswordReset: true,
      mfaSecret: secret,
      mfaConfirmed: true,
    });

    const result = await testLogin(user.email as string, 'password', user.id);
    expect(result.status).toBe('resetPassword');
  });

  it('should ask for MFA', async () => {
    const result = await testLogin(
      'admin@aalto.fi',
      'password',
      undefined,
      null
    );
    expect(result.status).toBe('enterMfa');
  });

  it('should ask to reset MFA', async () => {
    const user = await createData.createAuthUser();

    const result = await testLogin(
      user.email as string,
      'password',
      undefined,
      null
    );
    expect(result.status).toBe('showMfa');
  });

  it('should respond with 401 when logging in with invalid credentials', async () => {
    const badCreds = responseTests.testUnauthorized(
      '/v1/auth/login',
      '{"errors":["Incorrect email or password"]}'
    );

    await badCreds.post({email: 'admin', password: 'password', otp: '123456'});
    await badCreds.post({
      email: 'aalto.fi',
      password: 'password',
      otp: '123456',
    });
    await badCreds.post({email: 'admin@aalto.fi', password: '', otp: '123456'});
    await badCreds.post({
      email: 'admin@aalto.fi',
      password: 'password ',
      otp: '123456',
    });
  });

  it('should respond with 401 when logging in with an invalid TOTP code', async () => {
    const badCreds = responseTests.testUnauthorized(
      '/v1/auth/login',
      '{"errors":["Incorrect TOTP code"]}'
    );

    // Can theoretically succeed :P
    await badCreds.post({
      email: 'admin@aalto.fi',
      password: 'password',
      otp: '123456',
    });
  });
});

describe('Test POST /v1/auth/login and expiry', () => {
  it('should expire the session after a set time', async () => {
    // Use the agent for cookie persistence
    const agent = supertest.agent(app);
    const realDate = new Date();
    const token = await getToken(1);
    await agent
      .post('/v1/auth/login')
      .withCredentials(true)
      .send({email: 'admin@aalto.fi', password: 'password', otp: token})
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok);
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Ok);
    const jwt = agent.jar.getCookie('jwt', CookieAccessInfo.All);
    if (!jwt) throw new Error('jwt not available');

    // Simulate situation where the browser does not properly expire the cookie
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

describe('Test POST /v1/auth/reset-own-password - reset own password', () => {
  it('should reset own password', async () => {
    const secret = authenticator.generateSecret(64);
    const user = await createData.createAuthUser({
      forcePasswordReset: true,
      mfaSecret: secret,
      mfaConfirmed: true,
    });
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';

    const res = await request
      .post('/v1/auth/reset-own-password')
      .send({email: user.email, password: 'password', newPassword: newPassword})
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');

    const loginResult = await testLogin(
      user.email as string,
      newPassword,
      user.id
    );
    expect(loginResult.status).toBe('ok');
  });

  it('should reset own password when MFA is not set', async () => {
    const user = await createData.createAuthUser({forcePasswordReset: true});
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';

    const res = await request
      .post('/v1/auth/reset-own-password')
      .send({email: user.email, password: 'password', newPassword: newPassword})
      .expect(HttpCode.Ok);

    expect(JSON.stringify(res.body)).toBe('{}');

    const loginResult = await testLogin(user.email as string, newPassword);
    expect(loginResult.status).toBe('showMfa');
  });

  it('should respond with 400 if too weak password', async () => {
    const user = await createData.createAuthUser({forcePasswordReset: true});
    const newPassword = 'weak';

    const data = {email: user.email, password: 'password', newPassword};
    await responseTests
      .testBadRequest('/v1/auth/reset-own-password', null)
      .post(data);

    const result = await testLogin(user.email as string, 'password');
    expect(result.status).toBe('resetPassword');
  });

  it('should respond with 400 if same password', async () => {
    const password = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';
    const user = await createData.createAuthUser({
      password,
      forcePasswordReset: true,
    });

    const data = {email: user.email, password, newPassword: password};
    await responseTests
      .testBadRequest('/v1/auth/reset-own-password', null)
      .post(data);

    const result = await testLogin(user.email as string, password);
    expect(result.status).toBe('resetPassword');
  });

  it('should respond with 401 when wrong password', async () => {
    const user = await createData.createAuthUser({forcePasswordReset: true});
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';

    const data = {email: user.email, password: 'wrong', newPassword};
    await responseTests
      .testUnauthorized(
        '/v1/auth/reset-own-password',
        '{"errors":["Incorrect email or password"]}'
      )
      .post(data);

    const result = await testLogin(user.email as string, 'password');
    expect(result.status).toBe('resetPassword');
  });
});

describe("Test POST /v1/auth/reset-auth/:userId - reset other admin's auth details", () => {
  // Broken if cookies are not refetched for some reason :/
  beforeAll(async () => {
    cookies = await getCookies();
  });

  it("Should reset other admin's password", async () => {
    const user = await createData.createAuthUser();

    const res = await request
      .post(`/v1/auth/reset-auth/${user.id}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .send({resetPassword: true, resetMfa: false})
      .expect(HttpCode.Ok);

    const result = ResetAuthResultSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
    const loginResult = await testLogin(
      user.email as string,
      result.data?.temporaryPassword as string
    );
    expect(loginResult.status).toBe('resetPassword');
  });

  it("Should reset other admin's MFA", async () => {
    const user = await createData.createAuthUser();

    const res = await request
      .post(`/v1/auth/reset-auth/${user.id}`)
      .set('Cookie', cookies.adminCookie)
      .set('Accept', 'application/json')
      .send({resetPassword: false, resetMfa: true})
      .expect(HttpCode.Ok);

    const result = ResetAuthResultSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
    const loginResult = await testLogin(user.email as string, 'password');
    expect(loginResult.status).toBe('showMfa');
  });

  it('should respond with 401 or 403 if not authorized', async () => {
    const user = await createData.createAuthUser();
    const url = `/v1/auth/reset-auth/${user.id}`;

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

describe('Test POST /v1/auth/change-own-auth - change own auth', () => {
  const createUser = async (): Promise<[UserData, string[]]> => {
    const secret = authenticator.generateSecret(64);
    const user = await createData.createAuthUser({
      mfaSecret: secret,
    });
    const token = await getToken(user.id);
    const userRes = await request
      .post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({email: user.email, password: 'password', otp: token});
    const cookie = [userRes.headers['set-cookie']];
    return [user, cookie];
  };

  it('Should reset own password', async () => {
    const [user, cookie] = await createUser();
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';

    const res = await request
      .post('/v1/auth/change-own-auth')
      .send({resetPassword: true, resetMfa: false, newPassword})
      .set('Cookie', cookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = ChangeOwnAuthResponseSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
    expect(result.data?.otpAuth).toBeNull();

    const loginResult = await testLogin(user.email as string, newPassword);
    expect(loginResult.status).toBe('enterMfa');
  });

  it('Should reset own MFA', async () => {
    const [, cookie] = await createUser();

    const res = await request
      .post('/v1/auth/change-own-auth')
      .send({resetPassword: false, resetMfa: true})
      .set('Cookie', cookie)
      .set('Accept', 'application/json')
      .expect(HttpCode.Ok);

    const result = ChangeOwnAuthResponseSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
    expect(result.data?.otpAuth).toBeTruthy();
  });

  it('should respond with 400 if new password is too weak', async () => {
    const [, cookie] = await createUser();
    const newPassword = 'weak';

    await responseTests
      .testBadRequest('/v1/auth/change-own-auth', cookie)
      .post({newPassword});
  });

  it('should respond with 401 authorized', async () => {
    const url = '/v1/auth/change-own-auth';
    const newPassword = '¹X)1Õ,ì?¨ã$Z©N3Ú°jM¤ëÊyf';

    await responseTests.testUnauthorized(url).post({newPassword});

    await responseTests
      .testForbidden(url, [
        cookies.teacherCookie,
        cookies.assistantCookie,
        cookies.studentCookie,
      ])
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
