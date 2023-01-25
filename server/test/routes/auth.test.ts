// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from '../../src/app';
import supertest, { SuperAgentTest } from 'supertest';
import { UserRole } from '../../src/controllers/auth';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test POST /v1/auth/login', () => {
  it('should respond disallow logging in with invalid credentials', async () => {
    async function badCreds(credentials: { username: string, password: string }): Promise<void> {
      return request.post('/v1/auth/login')
        .set('Accept', 'application/json')
        .send(credentials)
        .expect(401)
        .expect('Content-Type', /json/)
        .then((res: supertest.Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toMatch(/(invalid|Missing) credentials/);
        });
    }
    await badCreds({ username: 'aalto', password: 'grades' });
    await badCreds({ username: 'aalto', password: '' });
    await badCreds({ username: 'sysadmin@aalto.fi', password: '' });
    await badCreds({ username: 'sysadmin@aalto.fi', password: 'grade' });
  });
  it('should allow logging in with the correct credentials', async() => {
    await request.post('/v1/auth/login')
      .send({ username: 'sysadmin@aalto.fi', password: 'grades' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(true);
        expect(res.body.role).toBe(UserRole.Admin);
      });
  });
});

describe('Test POST /v1/auth/signup', () => {
  it('should prevent creating a new account with a previously registered email', async () => {
    return request.post('/v1/auth/signup')
      .set('Accept', 'application/json')
      .send({ email: 'sysadmin@aalto.fi', username: 'aalto', password: 'grades', studentID: '123456', role: 'ADMIN' })
      .expect(400)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(false);
        expect(res.body.error).toMatch('user exists already');
      });
  });
  it('should error when the signup format is incorrect', async () => {
    return request.post('/v1/auth/signup')
      .set('Accept', 'application/json')
      .send({ email: 'sysadmin@aalto.fi', password: 'grades' })
      .expect(400)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(false);
        expect(res.body.error).toMatch('Invalid signup request format');
      });
  });
  it('should allow creation of a new account', async () => {
    await request.post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({ username: 'sysadmin2@aalto.fi', password: 'grades2'})
      .expect(401);
    await request.post('/v1/auth/signup')
      .set('Accept', 'application/json')
      .send({ email: 'sysadmin2@aalto.fi', username: 'aalto2', password: 'grades2', studentID: '123457', role: 'ADMIN' })
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(true);
        expect(res.body.message);
      });
    return request.post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({ username: 'sysadmin2@aalto.fi', password: 'grades2'})
      .expect(200);
  });
});

describe('Test GET /v1/auth/self-info and cookies', () => {
  it('should act differently when user is logged in or out', async () => {
    // Use the agent for cookie persistence
    const agent: SuperAgentTest = supertest.agent(app);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(401);
    await agent.post('/v1/auth/login')
      .withCredentials(true)
      .send({ username: 'sysadmin@aalto.fi', password: 'grades' })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect('set-cookie', /jwt=/)
      .expect('set-cookie', /httponly/i);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(200);
    await agent.post('/v1/auth/logout').withCredentials(true).send({}).expect(200);
    await agent.get('/v1/auth/self-info').withCredentials(true).expect(401);
  });
});
