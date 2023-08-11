// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData, HttpCode, SystemRole } from 'aalto-grades-common/types';
import { Request, Response } from 'express';

import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import { ApiError, CourseFull, idSchema, JwtClaims } from '../types';
import { parseCourseFull } from './utils/course';
import { findUserById } from './utils/user';

// Sequelize says User is not associated to CourseInstance unless this is here.
// TODO: Remove if possible.
require('../database/models/courseInstanceRole');

// Check user id matches queried and system rights and exists.
async function adminOrOwner(req: Request): Promise<User> {
  const userId: number = Number(req.params.userId);
  const userToken: JwtClaims = req.user as JwtClaims;
  await idSchema.validate({ id: userId });

  if (userId !== userToken.id && userToken.role !== SystemRole.Admin) {
    throw new ApiError('cannot access users courses', HttpCode.Forbidden);
  }

  // Confirm that user exists and return.
  return await findUserById(userId, HttpCode.NotFound);
}

export async function getCoursesOfUser(req: Request, res: Response): Promise<void> {
  const courses: Array<CourseData> = [];
  const user: User = await adminOrOwner(req);

  const inChargeCourses: Array<CourseFull> =
    await Course.findAll({
      include: [
        {
          model: CourseTranslation
        },
        {
          model: User,
          where: {
            id: user.id
          }
        }
      ]
    }) as Array<CourseFull>;

  interface CourseInstanceWithCourseFull extends CourseInstance {
    Course: CourseFull
  }

  const instanceRoleCourses: Array<CourseInstanceWithCourseFull> =
    await CourseInstance.findAll({
      include: [
        {
          model: User,
          where: {
            id: user.id
          }
        },
        {
          model: Course,
          include: [
            {
              model: CourseTranslation
            },
            {
              model: User
            }
          ]
        }
      ]
    }) as Array<CourseInstanceWithCourseFull>;

  for (const course of inChargeCourses) {
    courses.push(parseCourseFull(course));
  }

  for (const instance of instanceRoleCourses) {
    if (courses.find((course: CourseData) => course.id === instance.Course.id))
      continue;

    courses.push(parseCourseFull(instance.Course));
  }

  res.status(HttpCode.Ok).send({
    data: courses
  });
}

export async function getUserInfo(req: Request, res: Response): Promise<void> {
  const user: User = await adminOrOwner(req);

  res.status(HttpCode.Ok).send({
    data: {
      id: user.id,
      studentNumber: user.studentNumber,
      name: user.name,
      email: user.email
    }
  });
}
