// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {authenticator} from 'otplib';
import supertest from 'supertest';

import {app} from '../../src/app';
import User from '../../src/database/models/user';

const request = supertest(app);

export type Cookies = {
  adminCookie: [string];
  teacherCookie: [string];
  assistantCookie: [string];
  studentCookie: [string];
};

type UserCredentials = {id: number; email: string; password: string};
const users: UserCredentials[] = [
  {id: 1, email: 'admin@aalto.fi', password: 'password'},
  {id: 2, email: 'teacher@aalto.fi', password: 'password'},
  {id: 3, email: 'assistant@aalto.fi', password: 'password'},
  {id: 4, email: 'student@aalto.fi', password: 'password'},
];

/** Generate mfa tokens for all users by logging in once */
const generateMfaToken = async (user: UserCredentials): Promise<string> => {
  await request
    .post('/v1/auth/login')
    .set('Accept', 'application/json')
    .send({email: user.email, password: user.password, otp: null});

  const dbUser = await User.findByPk(user.id);
  const secret = dbUser?.mfaSecret as string;
  return authenticator.generate(secret);
};

const getCookie = async (user: UserCredentials): Promise<[string]> => {
  // Try multiple times in case token happens to become invalid just before login.
  for (let attempt = 0; attempt < 3; attempt++) {
    const token = await generateMfaToken(user);
    const res = await request
      .post('/v1/auth/login')
      .set('Accept', 'application/json')
      .send({email: user.email, password: user.password, otp: token});
    if (res.status === 200) return [res.headers['set-cookie']];
  }
  throw new Error(`Failed to get cookie for user ${user.email}`);
};

/**
 * Utility function to generate and retrieve cookies for some accounts. The
 * function simulates login requests for roles and extracts cookies from the
 * responses. These cookies can be used to simulate authenticated requests in
 * testing scenarios.
 *
 * @returns {Promise<Cookies>} Generated cookies.
 */
export const getCookies = async (): Promise<Cookies> => {
  return {
    adminCookie: await getCookie(users[0]),
    teacherCookie: await getCookie(users[1]),
    assistantCookie: await getCookie(users[2]),
    studentCookie: await getCookie(users[3]),
  };
};
