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

  const instanceRoleCourses: Array<CourseFull> =
    await Course.findAll({
      include: [
        {
          model: CourseInstance,
          attributes: [],
          include: [
            {
              model: User,
              attributes: [],
              where: {
                id: userId
              }
            }
          ]
        },
        {
          model: CourseTranslation
        },
        {
          model: User
        }
      ]
    }) as Array<CourseFull>;

  for (const course of inChargeCourses) {
    courses.push(parseCourseFull(course));
  }

  for (const course of instanceRoleCourses) {
    if (courses.find((added: CourseData) => added.id === course.id))
      continue;

    courses.push(parseCourseFull(course));
  }

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courses: courses
    }
  });
}
