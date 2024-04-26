// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';

import {
  AddIdpUser,
  CourseData,
  HttpCode,
  IdpUsers,
  SystemRole,
} from '@common/types';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';
import {ApiError, CourseFull} from '../types';
import {parseCourseFull} from './utils/course';
import {findAndValidateUserId, validateUserId} from './utils/user';

/**
 * Responds with CourseData[]
 */
export const getCoursesOfUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = await validateUserId(req.params.userId);

  const inChargeCourses: CourseFull[] = (await Course.findAll({
    include: [
      {model: CourseTranslation},
      {
        model: User,
        as: 'Users',
        where: {id: userId},
      },
    ],
  })) as CourseFull[];

  const inCourses: CourseFull[] = (await Course.findAll({
    include: [
      {model: CourseTranslation},
      {
        model: User,
        where: {id: userId},
        through: {attributes: ['role']},
      },
    ],
  })) as CourseFull[];

  const courseData: CourseData[] = [];
  for (const course of inChargeCourses) {
    courseData.push(parseCourseFull(course));
  }

  for (const course of inCourses) {
    if (courseData.find(courseIn => courseIn.id === course.id)) continue;
    courseData.push(parseCourseFull(course));
  }

  res.json(courseData);
};

export const addIdpUser = async (
  req: Request<ParamsDictionary, unknown, AddIdpUser>,
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

/**
 * Responds with IdpUsers
 */
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

export const deleteIdpUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await findAndValidateUserId(req.params.userId);
  await user.destroy();
  res.sendStatus(HttpCode.Ok);
};
