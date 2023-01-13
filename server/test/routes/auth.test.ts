// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { app } from '../../src/app';
import supertest from 'supertest';
import { UserRole } from '../../src/controllers/auth';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('Test login route', () => {
  it('should respond disallow logging in with invalid credentials', () => {
    function badCreds(credentials: { username: string, password: string }) {
      request.post('/v1/auth/login')
      	.set('Accept', 'application/json')
        .send(credentials)
        .expect((res) => {
          console.log(res.status);
          return true;
        })
        .expect('Content-Type', /json/)
        .expect(401)
        .then((res: supertest.Response) => {
          expect(res.body.success).toBe(false);
          expect(res.body.message).toBe('invalid credentials');
        });
    }
    badCreds({ username: 'aalto', password: 'grades' });
    badCreds({ username: 'aalto', password: '' });
    badCreds({ username: 'sysadmin@aalto.fi', password: '' });
    badCreds({ username: 'sysadmin@aalto.fi', password: 'grades' });
    request.post('/v1/auth/login')
      .send({ username: 'sysadmin@aalto.fi', password: 'grades' })
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res: supertest.Response) => {
        expect(res.body.success).toBe(true);
        expect(res.body.role).toBe(UserRole.Admin);
      });
  });
});
