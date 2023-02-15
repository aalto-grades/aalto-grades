// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import User from '../../database/models/user';

import { ApiError } from '../../middleware/errorHandler';
import { HttpCode } from '../../types/httpCode';

/**
 * Finds a user by its ID.
 * @param {number} userId - The ID of the user to be found.
 * @returns {Promise<User>} - A promise that resolves with the found user model object.
 * @throws {Error} - If the user is not found, it throws an error with a message
 * indicating the missing user with the specific ID.
 */
export async function findUserById(userId: number): Promise<User> {
  const user: User | null = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(`user with ID ${userId} not found`, HttpCode.NotFound);
  }
  return user;
}
