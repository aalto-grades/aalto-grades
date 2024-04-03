// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import {Request, Response} from 'express';
import {ParamsDictionary} from 'express-serve-static-core';
import {z} from 'zod';

import {CourseData, HttpCode, SystemRole} from '@common/types';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';
import {ApiError, CourseFull} from '../types';
import {parseCourseFull} from './utils/course';
import {adminOrOwner, findAndValidateUserId} from './utils/user';

// Sequelize says User is not associated to CourseInstance unless this is here.
// TODO: Remove if possible.
require('../database/models/courseInstanceRole');

export const getCoursesOfUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const user = await adminOrOwner(req);

  const inChargeCourses = (await Course.findAll({
    include: [
      {model: CourseTranslation},
      {
        model: User,
        where: {id: user.id},
      },
    ],
  })) as CourseFull[];

  interface CourseInstanceWithCourseFull extends CourseInstance {
    Course: CourseFull;
  }

  const instanceRoleCourses = (await CourseInstance.findAll({
    include: [
      {
        model: User,
        where: {id: user.id},
      },
      {
        model: Course,
        include: [{model: CourseTranslation}, {model: User}],
      },
    ],
  })) as CourseInstanceWithCourseFull[];

  const courses: CourseData[] = [];
  for (const course of inChargeCourses) {
    courses.push(parseCourseFull(course));
  }

  for (const instance of instanceRoleCourses) {
    if (courses.find(course => course.id === instance.Course.id)) continue;

    courses.push(parseCourseFull(instance.Course));
  }

  res.status(HttpCode.Ok).send({data: courses});
};

export const addIddUserBodySchema = z.object({email: z.string().email()});
type AddIdpUserBody = z.infer<typeof addIddUserBodySchema>;

export const addIdpUser = async (
  req: Request<ParamsDictionary, unknown, AddIdpUserBody>,
  res: Response
): Promise<void> => {
  const email = req.body.email;

  const userAlreadyExists = await User.findIdpUserByEmail(email);
  if (userAlreadyExists) {
    throw new ApiError('User already exists', HttpCode.Conflict);
  }

  await User.create({email: email, role: SystemRole.User});
  res.status(HttpCode.Created).send();
};

export async function getIdpUsers(req: Request, res: Response): Promise<void> {
  const idpUsers = await User.findIdpUsers();
  const users: {email: string; id: number}[] = idpUsers.map(user => ({
    email: user.email,
    id: user.id,
  }));

  res.status(HttpCode.Ok).json({data: users});
}

export async function deleteIdpUser(
  req: Request,
  res: Response
): Promise<void> {
  const user = await findAndValidateUserId(req.params.userId);
  await user.destroy();
  res.status(HttpCode.Ok).send();
}
