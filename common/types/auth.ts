// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum SystemRole {
  User = 'USER',
  Admin = 'ADMIN',
}

export interface LoginResult {
  id: number;
  name: string;
  role: SystemRole;
}

export type PlainPassword = string;

export interface SignupRequest {
  name: string;
  password: PlainPassword;
  email: string;
  studentNumber?: string;
  role?: SystemRole;
}
