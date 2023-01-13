// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import User from '../database/models/user';

/**
 * Finds a user by its id.
 * @param {number} userId - The id of the user to be found.
 * @returns {Promise<User>} - A promise that resolves with the found user object.
 * @throws {Error} - If the user is not found, it throws an error with a message indicating the missing user with the specific id.
 */
export async function findUserById(userId: number): Promise<User> {
  const user: User | null = await User.findByPk(userId);
  if (!user) throw new Error (`user with id ${userId} not found`);
  return user;
}
