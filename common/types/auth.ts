// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

export enum SystemRole {
  User = 'USER',
  Admin = 'ADMIN'
}

export interface LoginResult {
  id: number,
  name: string,
  role: SystemRole
}
