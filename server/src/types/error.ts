// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { HttpCode } from '../types/httpCode';

/**
 * ApiError class represents a custom error that includes status code and optional multiple
 * error messages. This class extends the native Error class and adds a status code and
 * an optional array of multiple error messages. It is useful for providing more context
 * about an API-related error that occurred during the execution of an operation.
 * @extends {Error}
*/
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly multiError: Array<string> | undefined;

  /**
   * Creates an instance of ApiError.
   * @param {string} message - The error message.
   * @param {HttpCode} statusCode - The HTTP status code associated with the error.
   * @param {Array<string>} [multiError] - Optional array of multiple error messages.
  */
  constructor(message: string, statusCode: HttpCode, multiError?: Array<string>,) {
    super(message);
    this.statusCode = statusCode;
    this.multiError = multiError;
    this.name = 'ApiError';
  }
}
