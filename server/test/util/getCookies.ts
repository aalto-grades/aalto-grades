// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import supertest from 'supertest';

import {app} from '../../src/app';

const request = supertest(app);
export type Cookies = {
  adminCookie: string[];
  teacherCookie: string[];
};

/**
 * Utility function to generate and retrieve cookies for an admin and teacher account.
 * The function simulates login requests for both roles and extracts cookies from the response.
 * These cookies can be used to simulate authenticated requests in testing scenarios.
 * @returns {Promise<Cookies>} Generated cookies.
 */
export const getCookies = async (): Promise<Cookies> => {
  const adminRes = await request
    .post('/v1/auth/login')
    .set('Accept', 'application/json')
    .send({email: 'admin@aalto.fi', password: 'password'});

  const teacherRes = await request
    .post('/v1/auth/login')
    .set('Accept', 'application/json')
    .send({email: 'teacher@aalto.fi', password: 'password'});

  return {
    adminCookie: [adminRes.headers['set-cookie']],
    teacherCookie: [teacherRes.headers['set-cookie']],
  };
};
