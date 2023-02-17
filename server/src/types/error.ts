// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { HttpCode } from '../types/httpCode';

export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: HttpCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}
