// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import User from '../database/models/user';

export async function findUserById(userId: number): Promise<User> {
  const user: User | null = await User.findByPk(userId);
  if (!user) throw new Error (`user with id ${userId} not found`);
  return user;
}
