// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';

import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';

import { CourseData } from '../types/course';
import { findUserById } from './utils/user';
import { idSchema } from '../types/general';
import { Language } from '../types/language';
import { HttpCode } from '../types/httpCode';

interface CourseWithTranslationAndInstance extends Course {
  CourseTranslations: Array<CourseTranslation>
  CourseInstances: Array<CourseInstance>
}

export interface CoursesOfUser {
  current: Array<CourseData>,
  previous: Array<CourseData>
}

export async function getCoursesOfUser(req: Request, res: Response): Promise<void> {
  const coursesOfUser: CoursesOfUser = { current: [], previous: [] };
  const teacherId: number = Number(req.params.userId);
  await idSchema.validate({ id: teacherId });

  /*
   * TODO: Check that the requester is logged in, 401 Unauthorized if not
   * TODO: Check that the requester is authorized to add a course instance, 403
   * Forbidden if not
   */

  // Confirm that teacher exists
  await findUserById(teacherId);

  // TODO: Go through course_role instead
  const courses: Array<CourseWithTranslationAndInstance> = await models.Course.findAll({
    attributes: ['id', 'courseCode'],
    include: [{
      model: CourseInstance,
      attributes: ['endDate'],
      where: {
        responsibleTeacher: teacherId
      },
    },
    {
      model: CourseTranslation,
      attributes: ['language', 'courseName', 'department'],
    }],
    order: [[CourseInstance, 'endDate', 'ASC']]
  }) as Array<CourseWithTranslationAndInstance>;

  // Construct CourseData objects and determine whether the course is current or previous.
  const currentDate: Date = new Date(Date.now());
  for (const i in courses) {
    const course: CourseWithTranslationAndInstance = courses[i];

    const courseData: CourseData = {
      id: course.id,
      courseCode: course.courseCode,
      department: {
        fi: '',
        sv: '',
        en: ''
      },
      name: {
        fi: '',
        sv: '',
        en: ''
      },
      evaluationInformation: {
        fi: '',
        sv: '',
        en: ''
      }
    };

    course.CourseTranslations.forEach((translation: CourseTranslation) => {
      switch (translation.language) {
      case Language.English:
        courseData.department.en = translation.department;
        courseData.name.en = translation.courseName;
        break;
      case Language.Finnish:
        courseData.department.fi = translation.department;
        courseData.name.fi = translation.courseName;
        break;
      case Language.Swedish:
        courseData.department.sv = translation.department;
        courseData.name.sv = translation.courseName;
        break;
      }
    });

    const latestEndDate: Date =
        new Date(String(course.CourseInstances[course.CourseInstances.length - 1].endDate));

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
