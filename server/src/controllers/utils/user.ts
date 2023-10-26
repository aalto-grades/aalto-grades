// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode} from 'aalto-grades-common/types';

import User from '../../database/models/user';
import TeacherInCharge from '../../database/models/teacherInCharge';

import {SystemRole} from 'aalto-grades-common/types';
import {ApiError, JwtClaims} from '../../types';

/**
 * Finds a user by its ID.
 * @param {number} userId - The ID of the user to be found.
 * @param {HttpCode} errorCode - HTTP status code to return if the user was not found.
 * @returns {Promise<User>} - A promise that resolves with the found user model object.
 * @throws {ApiError} - If the user is not found, it throws an error with a message
 * indicating the missing user with the specific ID.
 */
export async function findUserById(
  userId: number,
  errorCode: HttpCode
): Promise<User> {
  const user: User | null = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(`user with ID ${userId} not found`, errorCode);
  }
  return user;
}

/**
 * Function for checking is the user either admin on system level or
 * teacher in charge on course level.
 * @param {JwtClaims} user - User data from JWT.
 * @param {number} courseId - The ID of the course.
 * @param {HttpCode} errorCode - HTTP status code to return if the user access is denied.
 * @returns {Promise<User>} - A promise that resolves with the found user model object.
 * @throws {ApiError} - If the user is either admin or teacher in charge.
 */
export async function isTeacherInChargeOrAdmin(
  user: JwtClaims,
  courseId: number,
  errorCode: HttpCode
): Promise<void> {
  if (user.role === SystemRole.Admin) {
    return;
  }

  const teacher: TeacherInCharge | null = await TeacherInCharge.findOne({
    where: {
      userId: user.id,
      courseId,
    },
  });

  if (!teacher) {
    throw new ApiError(
      `user with ID ${user.id} is not allowed not execute the action`,
      errorCode
    );
  }
}
