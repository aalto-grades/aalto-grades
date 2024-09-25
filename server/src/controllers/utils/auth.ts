// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import argon from 'argon2';

import {type AuthData, HttpCode, SystemRole} from '@/common/types';
import {NODE_ENV} from '../../configs/environment';
import httpLogger from '../../configs/winston';
import User from '../../database/models/user';
import {ApiError} from '../../types';

/** @throws ApiError(401) */
export const validateLogin = async (
  email: string,
  password: string
): Promise<AuthData> => {
  const user = await User.findByEmail(email);

  if (user === null) {
    throw new ApiError('Incorrect email or password', HttpCode.Unauthorized);
  }
  if (user.password === null) {
    httpLogger.warn(`User password was null for user ${user.id}`);
    throw new ApiError('Incorrect email or password', HttpCode.Unauthorized);
  }

  const match = await argon.verify(user.password.trim(), password);

  if (!match) {
    throw new ApiError('Incorrect email or password', HttpCode.Unauthorized);
  }

  if (user.name === null) {
    httpLogger.error(`User name was null for user ${user.id}`);
    throw new ApiError(
      'User does not have a name',
      HttpCode.InternalServerError
    );
  }

  if (NODE_ENV === 'production' && !user.admin) {
    throw new ApiError(
      'User that is not an admin has local login',
      HttpCode.InternalServerError
    );
  } else if (NODE_ENV !== 'production' && !user.admin) {
    return {
      id: user.id,
      role: SystemRole.User, // In dev and tests some test user accounts also have local login.
      name: user.name,
    };
  }

  return {
    id: user.id,
    role: SystemRole.Admin, // Only admins have username and password login.
    name: user.name,
  };
};
