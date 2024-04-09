// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {SystemRole} from '@common/types';
import {app} from '../../src/app';

const request = supertest(app);

export interface Cookies {
  adminCookie: string[];
  userCookie: string[];
}

/**
 * Utility function to generate and retrieve cookies for an admin and user account.
 * The function simulates sign up requests for both roles and extracts cookies from the response.
 * These cookies can be used to simulate authenticated requests in testing scenarios.
 * @returns {Promise<Cookies>} Generated cookies.
 */
export async function getCookies(): Promise<Cookies> {
  const adminEmail: string = `admin${new Date().getTime()}@aalto.fi`;
  const userEmail: string = `user${new Date().getTime()}@aalto.fi`;

  // TODO: Signup route has been removed, use login instead
  const adminRes: supertest.Response = await request
    .post('/v1/auth/signup')
    .set('Accept', 'application/json')
    .send({
      email: adminEmail,
      name: 'aalto tester',
      password: 'grades',
      studentNumber: new Date().getTime(),
      role: SystemRole.Admin,
    });

  const userRes: supertest.Response = await request
    .post('/v1/auth/signup')
    .set('Accept', 'application/json')
    .send({
      email: userEmail,
      name: 'aalto tester',
      password: 'grades',
      studentNumber: new Date().getTime(),
      role: SystemRole.User,
    });

  return {
    adminCookie: [adminRes.headers['set-cookie']],
    userCookie: [userRes.headers['set-cookie']],
  };
}
