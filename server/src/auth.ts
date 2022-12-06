// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export type PlainPassword = string;
export enum UserRole {
  Student,
  Teacher,
  Admin,
};

export async function validateLogin(username: string, password: PlainPassword): Promise<UserRole> {
  if (username.toLowerCase() === 'aalto' && password === 'grades') {
    return UserRole.Admin;
  } else {
    throw 'Invalid credentials';
  }
}

export async function performSignup(username: string, email: string, plainPassword: PlainPassword, role: UserRole) {
  return;
}
