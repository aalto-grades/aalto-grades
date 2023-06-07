// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import { app } from '../../src/app';

const request: supertest.SuperTest<supertest.Test> = supertest(app);

export async function getCookies(): Promise<Array<string>> {
  const email: string = `${new Date().getTime()}@aalto.fi`;

  await request.post('/v1/auth/signup')
    .set('Accept', 'application/json')
    .send({
      email,
      name: 'aalto tester',
      password: 'grades',
      studentNumber: new Date().getTime(),
      role: 'SYSADMIN'
    });

  const res: supertest.Response = await request
    .post('/v1/auth/login')
    .set('Accept', 'application/json')
    .send({
      email,
      password: 'grades'
    });

  return res.headers['set-cookie'];
}
