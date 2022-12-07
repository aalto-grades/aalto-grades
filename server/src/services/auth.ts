// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

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
  if (username.toLowerCase() === 'aalto' && password === 'grades') {
    return UserRole.Admin;
  } else {
    throw new InvalidCredentials();
  }
}

export async function performSignup(username: string, email: string, plainPassword: PlainPassword, role: UserRole) {
  return;
}
