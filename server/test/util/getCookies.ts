// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';
import { SystemRole } from 'aalto-grades-common/types/auth';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

export interface Cookies {
  adminCookie: Array<string>
  userCookie: Array<string>
}

export async function getCookies(): Promise<Cookies> {
  const adminEmail: string = `admin${new Date().getTime()}@aalto.fi`;
  const userEmail: string = `user${new Date().getTime()}@aalto.fi`;

  await request.post('/v1/auth/signup')
    .set('Accept', 'application/json')
    .send({
      email: adminEmail,
      name: 'aalto tester',
      password: 'grades',
      studentNumber: new Date().getTime(),
      role: SystemRole.Admin
    });

  await request.post('/v1/auth/signup')
    .set('Accept', 'application/json')
    .send({
      email: userEmail,
      name: 'aalto tester',
      password: 'grades',
      studentNumber: new Date().getTime(),
      role: SystemRole.User
    });

  const adminRes: supertest.Response = await request
    .post('/v1/auth/login')
    .set('Accept', 'application/json')
    .send({
      email: adminEmail,
      password: 'grades'
    });

  const userRes: supertest.Response = await request
    .post('/v1/auth/login')
    .set('Accept', 'application/json')
    .send({
      email: userEmail,
      password: 'grades'
    });

  return {
    adminCookie: adminRes.headers['set-cookie'],
    userCookie: userRes.headers['set-cookie']
  };
}
