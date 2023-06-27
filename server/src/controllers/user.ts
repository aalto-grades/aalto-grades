// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';

import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import { CourseData, CoursesOfUser } from 'aalto-grades-common/types';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { parseCourseFull } from './utils/course';
import { findUserById } from './utils/user';
import { CourseFull } from '../types/model';

export async function getCoursesOfUser(req: Request, res: Response): Promise<void> {
  const coursesOfUser: CoursesOfUser = { current: [], previous: [] };
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

  interface CourseFullWithInstances extends CourseFull {
    CourseInstances: Array<CourseInstance>;
    CourseTranslations: Array<CourseTranslation>
  }

  const instanceRoleCourses: Array<CourseFullWithInstances> =
    await Course.findAll({
      include: [
        {
          model: CourseInstance,
          attributes: ['endDate'],
          include: [
            {
              model: User,
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
      ],
      order: [[CourseInstance, 'endDate', 'DESC']]
    }) as Array<CourseFullWithInstances>;

  for (const course of inChargeCourses) {
    coursesOfUser.current.push(parseCourseFull(course));
  }

  // Construct CourseData objects and determine whether the course is current or previous.
  const currentDate: Date = new Date(Date.now());
  for (const course of instanceRoleCourses) {
    // Don't include courses that have already been included as courses the
    // user is in charge of
    if (coursesOfUser.current.find((course: CourseData) => course.id === course.id))
      continue;

    const courseData: CourseData = parseCourseFull(course);

    const latestEndDate: Date = new Date(String(course.CourseInstances[0].endDate));

    if (currentDate <= latestEndDate) {
      coursesOfUser.current.push(courseData);
    } else {
      coursesOfUser.previous.push(courseData);
    }
  }

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courses: coursesOfUser
    }
  });
}
