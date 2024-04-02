// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode, SystemRole} from '@common/types';
import TeacherInCharge from '../../database/models/teacherInCharge';
import User from '../../database/models/user';
import {ApiError, JwtClaims} from '../../types';

/**
 * Finds a user by its ID and throws ApiError if not found.
 */
export const findUserById = async (userId: number): Promise<User> => {
  const user = await User.findByPk(userId);
  if (user === null) {
    throw new ApiError(`user with ID ${userId} not found`, HttpCode.NotFound);
  }
  return user;
};

/**
 * Function for checking is the user either admin on system level or teacher in charge on course level.
 * Throws ApiError if the user is neither an admin or the teacher in charge.
 */
export const isTeacherInChargeOrAdmin = async (
  user: JwtClaims,
  courseId: number
): Promise<void> => {
  if (user.role === SystemRole.Admin) return;

  const teacher = await TeacherInCharge.findOne({
    where: {userId: user.id, courseId},
  });

  if (teacher === null) {
    throw new ApiError(
      `user with ID ${user.id} is not allowed not execute the action`,
      HttpCode.Forbidden
    );
  }
};
