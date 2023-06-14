// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { SystemRole } from 'aalto-grades-common/types/auth';

export interface LoginCredentials {
  email: string,
  password: string
}

export interface SignupCredentials {
  email: string,
  password: string,
  studentNumber?: string,
  name: string,
  role: SystemRole
}
