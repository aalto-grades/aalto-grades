// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';

import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import { CourseData } from 'aalto-grades-common/types';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { parseCourseFull } from './utils/course';
import { findUserById } from './utils/user';
import { CourseFull } from '../types/model';

// Sequelize says User is not associated to CourseInstance unless this is here.
// TODO: Remove if possible.
require('../database/models/courseInstanceRole');

export async function getCoursesOfUser(req: Request, res: Response): Promise<void> {
  const courses: Array<CourseData> = [];
  const userId: number = Number(req.params.userId);
  await idSchema.validate({ id: userId });

  /*
   * TODO: Check that the requester is authorized to add a course instance, 403
   * Forbidden if not
   */

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
