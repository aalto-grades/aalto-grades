// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode, SystemRole} from '@common/types';
import {Cookie, CookieAccessInfo} from 'cookiejar';
import * as fs from 'fs';
import mockdate from 'mockdate';
import supertest from 'supertest';

import {
  JWT_COOKIE_EXPIRY_MS,
  JWT_EXPIRY_SECONDS,
} from '../../src/configs/constants';

import {app} from '../../src/app';

const request = supertest(app);

jest.mock('fs', () => {
  return {
    __esModule: true,
    ...jest.requireActual('fs'),
  };
});

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
      .send({email: 'sysadmin@aalto.fi', password: 'grades'})
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok)
      .expect('set-cookie', /jwt=/)
      .expect('set-cookie', /httponly/i);

    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Ok)
      .then((res: supertest.Response) => {
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.role).toBe(SystemRole.Admin);
        expect(res.body.data.name).toBe('Aalto Sysadmin');
      });
    await agent
      .post('/v1/auth/logout')
      .withCredentials(true)
      .send({})
      .expect(HttpCode.Ok);
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Unauthorized);
  });
});

describe('Test POST /v1/auth/login - logging in with an existing user', () => {
  it('should respond with 401 unauthorized, if logging in with invalid credentials', async () => {
    async function badCreds(credentials: {
      email: string;
      password: string;
    }): Promise<void> {
      return request
        .post('/v1/auth/login')
        .set('Accept', 'application/json')
        .send(credentials)
        .expect(HttpCode.Unauthorized)
        .expect('Content-Type', /json/)
        .then((res: supertest.Response) => {
          expect(res.body.data).not.toBeDefined();
          expect(res.body.errors[0]).toMatch(/incorrect email or password/);
        });
    }
    await badCreds({email: 'aalto', password: 'grades'});
    await badCreds({email: 'aalto', password: ''});
    await badCreds({email: 'sysadmin@aalto.fi', password: ''});
    await badCreds({email: 'sysadmin@aalto.fi', password: 'grade'});
  });

  it('should allow logging in with the correct credentials', async () => {
    await request
      .post('/v1/auth/login')
      .send({email: 'sysadmin@aalto.fi', password: 'grades'})
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok)
      .then((res: supertest.Response) => {
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.role).toBe(SystemRole.Admin);
        expect(res.body.data.name).toBe('Aalto Sysadmin');
      });
  });
});

describe('Test POST /v1/auth/signup - create a new user', () => {
  it('should respond with 409 conflict, if email address already taken', async () => {
    return request
      .post('/v1/auth/signup')
      .set('Accept', 'application/json')
      .send({
        email: 'sysadmin@aalto.fi',
        name: 'aalto',
        password: 'grades',
        studentNumber: '123456',
        role: SystemRole.Admin,
      })
      .expect(HttpCode.Conflict)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toMatch(
          'user account with the specified email already exists'
        );
      });
  });

  it('should respond with 400 bad request, if the signup format is incorrect', async () => {
    return request
      .post('/v1/auth/signup')
      .set('Accept', 'application/json')
      .send({email: 'sysadmin@aalto.fi', password: 'grades'})
      .expect(HttpCode.BadRequest)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.data).not.toBeDefined();
        expect(res.body.errors[0]).toMatch('name is a required field');
      });
  });

  it('should allow creation of a new account', async () => {
    await request
      .post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({email: 'sysadmin2@aalto.fi', password: 'grades2'})
      .expect(HttpCode.Unauthorized);
    await request
      .post('/v1/auth/signup')
      .set('Accept', 'application/json')
      // without student number
      .send({
        email: 'sysadmin2@aalto.fi',
        name: 'aalto2',
        password: 'grades2',
        role: SystemRole.Admin,
      })
      .expect(HttpCode.Ok)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.message);
      });
    return request
      .post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({email: 'sysadmin2@aalto.fi', password: 'grades2'})
      .expect(HttpCode.Ok)
      .then((res: supertest.Response) => {
        expect(res.body.errors).not.toBeDefined();
        expect(res.body.data.role).toBe(SystemRole.Admin);
        expect(res.body.data.name).toBe('aalto2');
      });
  });
});

describe('Test POST /v1/auth/login and expiry', () => {
  it('should expire the session after a set time', async () => {
    // Use the agent for cookie persistence
    const agent = supertest.agent(app);
    const realDate: Date = new Date();
    await agent
      .post('/v1/auth/login')
      .withCredentials(true)
      .send({email: 'sysadmin@aalto.fi', password: 'grades'})
      .expect('Content-Type', /json/)
      .expect(HttpCode.Ok);
    await agent
      .get('/v1/auth/self-info')
      .withCredentials(true)
      .expect(HttpCode.Ok);
    const jwt: Cookie | undefined = agent.jar.getCookie(
      'jwt',
      CookieAccessInfo.All
    );
    if (!jwt) {
      throw new Error('jwt not available');
    }
    // Simulate situtation where the browser does not properly expire the cookie
    mockdate.set(
      realDate.setMilliseconds(
        realDate.getMilliseconds() + JWT_COOKIE_EXPIRY_MS + 1
      )
    );
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
    await request.get('/v1/auth/login-idp').then((res: supertest.Response) => {
      expect(res.headers.location).toContain('idp.aalto');
    });
  });
});

describe('Test GET /v1/auth/saml/metadata - check metadata file exists', () => {
  it('should get a metadata file', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => 'mock');
    await request
      .get('/v1/auth/saml/metadata')
      .then((res: supertest.Response) => {
        expect(res.headers['content-type']).toContain('application/xml');
        expect(res.text).toContain('X509Certificate');
      });
  });
});
