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
  SystemRole,
} from '@/common/types';
import {app} from '../../src/app';
import {
  JWT_COOKIE_EXPIRY_MS,
  JWT_EXPIRY_SECONDS,
} from '../../src/configs/constants';
import {ErrorSchema} from '../util/general';

const request = supertest(app);

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('fs', () => ({__esModule: true, ...jest.requireActual('fs')}));

describe('Test GET /v1/auth/self-info - check users own info', () => {
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

describe('Test POST /v1/auth/login - logging in with an existing user', () => {
  it('should allow logging in with the correct credentials', async () => {
    const res = await request
      .post('/v1/auth/login')
      .send({email: 'admin@aalto.fi', password: 'password'})
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok);

    const result = LoginResultSchema.safeParse(res.body);
    expect(result.success).toBeTruthy();
    if (result.success) {
      expect(result.data.resetPassword).toBeFalsy();
      if (!result.data.resetPassword) {
        expect(result.data.role).toBe(SystemRole.Admin);
        expect(result.data.name).toBe('Andy Admin');
      }
    }
  });

  it('should respond with 401 unauthorized, if logging in with invalid credentials', async () => {
    const badCreds = async (credentials: {
      email: string;
      password: string;
    }): Promise<void> => {
      const res = await request
        .post('/v1/auth/login')
        .set('Accept', 'application/json')
        .send(credentials)
        .expect(HttpCode.Unauthorized)
        .expect('Content-Type', /json/);

      const result = ErrorSchema.safeParse(res.body);
      expect(result.success).toBeTruthy();
      if (result.success)
        expect(result.data.errors[0]).toMatch(/Incorrect email or password/);
    };

    await badCreds({email: 'admin', password: 'password'});
    await badCreds({email: 'aalto.fi', password: 'password'});
    await badCreds({email: 'admin@aalto.fi', password: ''});
    await badCreds({email: 'admin@aalto.fi', password: 'password '});
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
