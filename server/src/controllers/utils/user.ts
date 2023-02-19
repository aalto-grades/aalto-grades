// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import User from '../../database/models/user';

import { ApiError } from '../../types/error';
import { HttpCode } from '../../types/httpCode';

/**
 * Finds a user by its ID.
 * @param {number} userId - The ID of the user to be found.
 * @param {HttpCode} errorCode - HTTP status code to return if the user was not found.
 * @returns {Promise<User>} - A promise that resolves with the found user model object.
 * @throws {ApiError} - If the user is not found, it throws an error with a message
 * indicating the missing user with the specific ID.
 */
export async function findUserById(userId: number, errorCode: HttpCode): Promise<User> {
  const user: User | null = await User.findByPk(userId);
  if (!user) {
    // TODO: This may not be NotFound in all cases.
    throw new ApiError(`user with ID ${userId} not found`, errorCode);
  }
  return user;
}
