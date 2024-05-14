// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {TypedRequestBody} from 'zod-express-middleware';

import {
  CourseData,
  HttpCode,
  IdpUsers,
  NewIdpUserSchema,
  SystemRole,
} from '@/common/types';
import {parseCourseFull} from './utils/course';
import {findAndValidateUserId, validateUserId} from './utils/user';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';
import {ApiError, CourseFull} from '../types';

/**
 * Responds with CourseData[]
 *
 * @throws ApiError(400|404)
 */
export const getCoursesOfUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = await validateUserId(req.params.userId);

  const courses: CourseFull[] = (await Course.findAll({
    include: [
      {model: CourseTranslation},
      {
        model: User,
        as: 'Users',
        where: {id: userId},
      },
    ],
  })) as CourseFull[];

  const courseData: CourseData[] = [];
  for (const course of courses) {
    courseData.push(parseCourseFull(course));
  }

  res.json(courseData);
};

/** Responds with IdpUsers */
export const getIdpUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const idpUsers = await User.findIdpUsers();
  const users: IdpUsers = idpUsers.map(user => ({
    email: user.email,
    id: user.id,
  }));

  res.json(users);
};

/** @throws ApiError(409) */
export const addIdpUser = async (
  req: TypedRequestBody<typeof NewIdpUserSchema>,
  res: Response
): Promise<void> => {
  const email = req.body.email;

  const userAlreadyExists = await User.findIdpUserByEmail(email);
  if (userAlreadyExists) {
    throw new ApiError('User already exists', HttpCode.Conflict);
  }

  await User.create({email: email, role: SystemRole.User, name: email});
  res.sendStatus(HttpCode.Created);
};

/** @throws ApiError(400|404) */
export const deleteIdpUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await findAndValidateUserId(req.params.userId);
  await user.destroy();
  res.sendStatus(HttpCode.Ok);
};
