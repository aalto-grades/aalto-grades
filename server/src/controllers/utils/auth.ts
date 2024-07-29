// SPDX-FileCopyrightText: 2024 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import argon from 'argon2';

import {HttpCode, SystemRole} from '@/common/types';
import httpLogger from '../../configs/winston';
import User from '../../database/models/user';
import {ApiError, FullLoginResult} from '../../types';

/** @throws ApiError(401) */
export const validateLogin = async (
  email: string,
  password: string
): Promise<FullLoginResult> => {
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

  return {
    id: user.id,
    role: user.role as SystemRole,
    name: user.name,
    resetPassword: user.forcePasswordReset ?? false,
    resetMfa: user.mfaSecret === null,
  };
};
