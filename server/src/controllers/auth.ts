// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import User from '../database/models/user';
import argon from 'argon2';
import Op from 'sequelize/types/operators';

export type PlainPassword = string;
export enum UserRole {
  Student,
  Teacher,
  Admin,
}

export class InvalidCredentials extends Error {
  constructor() {
    super('invalid credentials');
  }
}

export class UserExists extends Error {
  constructor() {
    super('user exists already');
  }
}

export class InvalidFormat extends Error {
  constructor() {
    super('credential format is invalid, possibly bad email');
  }
}

export async function validateLogin(username: string, password: PlainPassword): Promise<UserRole> {
  const user = await User.findOne({
    attributes: ['password'],
    where: {
      email: username,
    }
  });
  if (user === null) {
    throw new InvalidCredentials();
  }
  const match = await argon.verify(user.password.trim(), password);
  if (!match) {
    throw new InvalidCredentials();
  }
  return UserRole.Admin;
}

export async function performSignup(username: string, email: string, plainPassword: PlainPassword, studentId: string): Promise<number> {
  const exists = await User.findOne({
    where: {
      [Op.or]: [
        { email },
        { name: username },
      ]
    }
  });

  if (exists !== null) {
    throw new UserExists();
  }

  try {
    const model = await User.create({
      name: username,
      email,
      password: await argon.hash(plainPassword.trim()),
      studentId,
    });
    return model.id;
  } catch (_e) {
      throw new InvalidFormat();
  }
}
