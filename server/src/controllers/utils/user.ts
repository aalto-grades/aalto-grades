// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {HttpCode, SystemRole} from '@common/types';
import CourseRole from '../../database/models/courseRole';
import User from '../../database/models/user';
import {ApiError, JwtClaims, stringToIdSchema} from '../../types';

/**
 * Finds a user by its ID.
 *
 * @throws ApiError(404) if not found.
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
 *
 * @throws ApiError(400|404) if invalid or not found.
 */
export const findAndValidateUserId = async (userId: string): Promise<User> => {
  const result = stringToIdSchema.safeParse(userId);
  if (!result.success) {
    throw new ApiError(`Invalid user id ${userId}`, HttpCode.BadRequest);
  }
  return await findUserById(result.data);
};

/**
 * Validates user id url param. @Throws ApiError(400|404) if invalid or user not
 * found.
 */
export const validateUserId = async (userId: string): Promise<number> => {
  const result = stringToIdSchema.safeParse(userId);
  if (!result.success) {
    throw new ApiError(`Invalid user id ${userId}`, HttpCode.BadRequest);
  }
  await findUserById(result.data);
  return result.data;
};

/**
 * Fetches user role in given course. Throws ApiError if the course role is not
 * found.
 */
export const getUserCourseRole = async (
  courseId: number,
  user: JwtClaims
): Promise<CourseRole> => {
  const courseRole = await CourseRole.findOne({
    where: {courseId, userId: user.id},
  });

  if (courseRole === null) {
    throw new ApiError(
      `user with ID ${user.id} is does not have a role in the course ${courseId}`,
      HttpCode.NotFound
    );
  }

  return courseRole;
};

/**
 * Checks if the user making the request is an admin or the owner of the data
 * being accessed. Throws ApiError if the user id is invalid or the user does
 * not have correct permissions.
 */
export const isAdminOrOwner = (userToken: JwtClaims, userId: number): void => {
  if (userId !== userToken.id && userToken.role !== SystemRole.Admin) {
    throw new ApiError("Cannot access user's data", HttpCode.Forbidden);
  }
};
