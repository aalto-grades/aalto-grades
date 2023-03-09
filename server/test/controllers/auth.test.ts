// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Cookie, CookieAccessInfo } from 'cookiejar';
import mockdate from 'mockdate';
import supertest, { SuperAgentTest } from 'supertest';

import { JWT_COOKIE_EXPIRY_MS, JWT_EXPIRY_SECONDS } from '../../src/configs/constants';

import { app } from '../../src/app';
import { UserRole } from '../../src/controllers/auth';
import { HttpCode } from '../../src/types/httpCode';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test POST /v1/auth/login', () => {
  it('should respond disallow logging in with invalid credentials', async () => {
    async function badCreds(credentials: { email: string, password: string }): Promise<void> {
      return request.post('/v1/auth/login')
        .set('Accept', 'application/json')
        .send(credentials)
        .expect(HttpCode.Unauthorized)
        .expect('Content-Type', /json/)
        .then((res: supertest.Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.data).not.toBeDefined();
          expect(res.body.errors[0]).toMatch(/incorrect email or password/);
        });
    }
    await badCreds({ email: 'aalto', password: 'grades' });
    await badCreds({ email: 'aalto', password: '' });
    await badCreds({ email: 'sysadmin@aalto.fi', password: '' });
    await badCreds({ email: 'sysadmin@aalto.fi', password: 'grade' });
  });
  it('should allow logging in with the correct credentials', async () => {
    await request.post('/v1/auth/login')
      .send({ email: 'sysadmin@aalto.fi', password: 'grades' })
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.role).toBe(UserRole.Admin);
      });
  });
});

describe('Test POST /v1/auth/signup', () => {
  it('should prevent creating a new account with a previously registered email', async () => {
    return request.post('/v1/auth/signup')
      .set('Accept', 'application/json')
      .send({
        email: 'sysadmin@aalto.fi',
        name: 'aalto',
        password: 'grades',
        studentID: '123456',
        role: 'SYSADMIN'
      })
      .expect(HttpCode.Conflict)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toMatch('user account with the specified email already exists');
      });
  });
  it('should error when the signup format is incorrect', async () => {
    return request.post('/v1/auth/signup')
      .set('Accept', 'application/json')
      .send({ email: 'sysadmin@aalto.fi', password: 'grades' })
      .expect(HttpCode.BadRequest)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(false);
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toMatch('invalid signup request format');
      });
  });
  it('should allow creation of a new account', async () => {
    await request.post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({ email: 'sysadmin2@aalto.fi', password: 'grades2'})
      .expect(HttpCode.Unauthorized);
    await request.post('/v1/auth/signup')
      .set('Accept', 'application/json')
      // without student id
      .send({ email: 'sysadmin2@aalto.fi', name: 'aalto2', password: 'grades2', role: 'SYSADMIN' })
      .expect(HttpCode.Ok)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(true);
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.message);
      });
    return request.post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({ email: 'sysadmin2@aalto.fi', password: 'grades2'})
      .expect(HttpCode.Ok);
  });
});

describe('Test GET /v1/auth/self-info and cookies', () => {
  it('should act differently when user is logged in or out', async () => {
    // Use the agent for cookie persistence
    const agent: SuperAgentTest = supertest.agent(app);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Unauthorized);
    await agent.post('/v1/auth/login')
      .withCredentials(true)
      .send({ email: 'sysadmin@aalto.fi', password: 'grades' })
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok)
      .expect('set-cookie', /jwt=/)
      .expect('set-cookie', /httponly/i);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Ok);
    await agent.post('/v1/auth/logout').withCredentials(true).send({}).expect(HttpCode.Ok);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Unauthorized);
  });
});

describe('Test POST /v1/auth/login and expiry', () => {
  it('should expire the session after a set time', async () => {
    // Use the agent for cookie persistence
    const agent: SuperAgentTest = supertest.agent(app);
    const realDate: Date = new Date();
    await agent.post('/v1/auth/login')
      .withCredentials(true)
      .send({ email: 'sysadmin@aalto.fi', password: 'grades' })
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Ok);
    const jwt: Cookie | undefined = agent.jar.getCookie('jwt', CookieAccessInfo.All);
    if (!jwt) {
      throw new Error('jwt not available');
    }
    // Simulate situtation where the browser does not properly expire the cookie
    mockdate.set(realDate.setMilliseconds(realDate.getMilliseconds() + JWT_COOKIE_EXPIRY_MS + 1));
    jwt.expiration_date = realDate.setSeconds(realDate.getSeconds() + JWT_EXPIRY_SECONDS * 2);
    agent.jar.setCookie(jwt);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Ok);
    mockdate.set(realDate.setSeconds(realDate.getSeconds() + JWT_EXPIRY_SECONDS + 1));
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(HttpCode.Unauthorized);
  });
});
