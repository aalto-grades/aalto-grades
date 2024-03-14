// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {CourseData, HttpCode, SystemRole, UserData} from '@common/types';
import {Request, Response} from 'express';

import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import {ApiError, CourseFull, idSchema, JwtClaims} from '../types';
import {parseCourseFull} from './utils/course';
import {findUserById} from './utils/user';

// Sequelize says User is not associated to CourseInstance unless this is here.
// TODO: Remove if possible.
require('../database/models/courseInstanceRole');

/**
 * Checks if the user making the request is an admin or the owner of the data being accessed.
 * @param {Request} req - Express request object containing user info and the userId parameter.
 * @returns {Promise<User>} Returns the User object if the user exists and has correct permissions.
 * @throws {ApiError} If the user does not have correct permissions or if the userId is invalid.
 */
async function adminOrOwner(req: Request): Promise<User> {
  const userId: number = Number(req.params.userId);
  const userToken: JwtClaims = req.user as JwtClaims;
  await idSchema.validate({id: userId});

  if (userId !== userToken.id && userToken.role !== SystemRole.Admin) {
    throw new ApiError("cannot access user's courses", HttpCode.Forbidden);
  }

  // Confirm that user exists and return.
  return await findUserById(userId, HttpCode.NotFound);
}

export async function getCoursesOfUser(
  req: Request,
  res: Response
): Promise<void> {
  const courses: Array<CourseData> = [];
  const user: User = await adminOrOwner(req);

  const inChargeCourses: Array<CourseFull> = (await Course.findAll({
    include: [
      {
        model: CourseTranslation,
      },
      {
        model: User,
        as: 'Users',
        where: {
          id: user.id,
        },
      },
    ],
  })) as Array<CourseFull>;

  interface CourseInstanceWithCourseFull extends CourseInstance {
    Course: CourseFull;
  }

  const instanceRoleCourses: Array<CourseInstanceWithCourseFull> =
    (await CourseInstance.findAll({
      include: [
        {
          model: User,
          where: {
            id: user.id,
          },
        },
        {
          model: Course,
          include: [
            {
              model: CourseTranslation,
            },
            {
              as: 'Users',
              model: User,
            },
          ],
        },
      ],
    })) as Array<CourseInstanceWithCourseFull>;

  for (const course of inChargeCourses) {
    courses.push(parseCourseFull(course));
  }

  for (const instance of instanceRoleCourses) {
    if (courses.find((course: CourseData) => course.id === instance.Course.id))
      continue;

    courses.push(parseCourseFull(instance.Course));
  }

  res.status(HttpCode.Ok).send({
    data: courses,
  });
}

export async function getUserInfo(req: Request, res: Response): Promise<void> {
  const user: User = await adminOrOwner(req);

  const userData: UserData = {
    id: user.id,
    studentNumber: user.studentNumber,
    name: user.name,
    email: user.email,
  };

  res.status(HttpCode.Ok).send({
    data: userData,
  });
}

export async function addIdpUser(req: Request, res: Response): Promise<void> {
  const email: string | undefined = req.body.email;
  if (!email) {
    throw new ApiError('Bad request', HttpCode.BadRequest);
  }
  const userAlreadyExists = await User.findIdpUserByEmail(email);
  if (userAlreadyExists) {
    throw new ApiError('User already exists', HttpCode.Conflict);
  }
  await User.create({
    email: email,
    role: SystemRole.User,
  });
  res.status(HttpCode.Created).send();
}

export async function getIdpUsers(req: Request, res: Response): Promise<void> {
  const users: Array<{email: string}> = (await User.findIdpUsers()).map(
    user => ({email: user.email, id: user.id})
  );
  res.status(HttpCode.Ok).json({
    data: users,
  });
}

export async function deleteIdpUser(
  req: Request,
  res: Response
): Promise<void> {
  const userId: string | undefined = req.params.userId;
  if (!userId) {
    throw new ApiError('Bad request', HttpCode.BadRequest);
  }
  const user = await User.findByPk(userId);
  if (!user || user?.password) {
    throw new ApiError('User not found', HttpCode.NotFound);
  }
  await user.destroy();
  res.status(HttpCode.Ok).send();
}
