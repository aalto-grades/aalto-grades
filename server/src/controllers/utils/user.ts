// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode, SystemRole} from '@common/types';
import {Request} from 'express';
import TeacherInCharge from '../../database/models/teacherInCharge';
import User from '../../database/models/user';
import {ApiError, JwtClaims, idSchema} from '../../types';

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
 * Finds a user by url param id and also validates the url param.
 * Throws ApiError if not found.
 */
export const findAndValidateUserId = async (userId: string): Promise<User> => {
  const result = idSchema.safeParse(userId);
  if (!result.success) {
    throw new ApiError(`Invalid user id ${userId}`, HttpCode.BadRequest);
  }
  return await findUserById(result.data);
};

/**
 * Validates user id url param. Throws ApiError if invalid or user not found.
 */
export const validateUserId = async (userId: string): Promise<number> => {
  const result = idSchema.safeParse(userId);
  if (!result.success) {
    throw new ApiError(`Invalid user id ${userId}`, HttpCode.BadRequest);
  }
  await findUserById(result.data);
  return result.data;
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

/**
 * Checks if the user making the request is an admin or the owner of the data being accessed.
 * Throws ApiError if the user id is invalid or the user does not have correct permissions.
 */
export const adminOrOwner = async (req: Request): Promise<User> => {
  const userId = await validateUserId(req.params.userId);
  const userToken = req.user as JwtClaims;

  if (userId !== userToken.id && userToken.role !== SystemRole.Admin) {
    throw new ApiError("cannot access user's courses", HttpCode.Forbidden);
  }

  // Confirm that user exists and return.
  return await findUserById(userId);
};
