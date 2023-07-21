// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';

import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import { CourseData, SystemRole } from 'aalto-grades-common/types';
import { ApiError, CourseFull, HttpCode, idSchema, JwtClaims } from '../types';
import { parseCourseFull } from './utils/course';
import { findUserById } from './utils/user';

// Sequelize says User is not associated to CourseInstance unless this is here.
// TODO: Remove if possible.
require('../database/models/courseInstanceRole');

export async function getCoursesOfUser(req: Request, res: Response): Promise<void> {
  const courses: Array<CourseData> = [];
  const userId: number = Number(req.params.userId);
  const user: JwtClaims = req.user as JwtClaims;

  await idSchema.validate({ id: userId });

  // Check user id matches queried and system rights.
  if (userId !== user.id && user.role !== SystemRole.Admin) {
    throw new ApiError('cannot access users courses', HttpCode.Forbidden);
  }

  // Confirm that user exists.
  await findUserById(userId, HttpCode.NotFound);

  const inChargeCourses: Array<CourseFull> =
    await Course.findAll({
      include: [
        {
          model: CourseTranslation
        },
        {
          model: User,
          where: {
            id: userId
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
            id: userId
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
    success: true,
    data: {
      courses: courses
    }
  });
}
