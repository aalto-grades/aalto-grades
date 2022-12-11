// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import User from '../database/models/user';
import argon from 'argon2';

export type PlainPassword = string;
export enum UserRole {
  Student,
  Teacher,
  Admin,
}

export class InvalidCredentials extends Error {
  constructor() {
    super('invalid credentials');
  }
}

export async function validateLogin(username: string, password: PlainPassword): Promise<UserRole> {
  const user = await User.findOne({
    attributes: ['password'],
    where: {
      email: username,
    }
  });
  if (user === null) {
    console.log('no such user');
    throw new InvalidCredentials();
  }
  const match = await argon.verify(user.password, password);
  if (!match) {
    console.log('not matching');
    throw new InvalidCredentials();
  }
  return UserRole.Admin;
}

export async function performSignup(username: string, email: string, plainPassword: PlainPassword, role: UserRole) {
  return;
}
