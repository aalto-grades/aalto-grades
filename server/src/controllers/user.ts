// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';

import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import { CourseData } from 'aalto-grades-common/types/course';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { parseCourseWithTranslation } from './utils/course';
import { findUserById } from './utils/user';

export interface CoursesOfUser {
  current: Array<CourseData>,
  previous: Array<CourseData>
}

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

  interface CourseWithTranslationAndInstance extends Course {
    CourseTranslations: Array<CourseTranslation>
    CourseInstances: Array<CourseInstance>
  }

  const courses: Array<CourseWithTranslationAndInstance> = await models.Course.findAll({
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
        model: CourseTranslation,
        attributes: ['language', 'courseName', 'department'],
      }
    ],
    order: [[CourseInstance, 'endDate', 'DESC']]
  }) as Array<CourseWithTranslationAndInstance>;

  // Construct CourseData objects and determine whether the course is current or previous.
  const currentDate: Date = new Date(Date.now());
  for (const course of courses) {
    /*
     * If the course instance array is empty, this user has no role in any
     * instance of this course. Meaning the user has not taken any part in this
     * course and it shouldn't be included in the result.
     *
     * TODO: Don't include courses like this in the query result to begin with.
     */
    if (course.CourseInstances.length == 0)
      continue;

    const courseData: CourseData = parseCourseWithTranslation(course);

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
