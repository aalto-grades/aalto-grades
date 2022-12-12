// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import { CourseData, Language } from './course';

export interface TeacherCourses {
  current: Array<CourseData>,
  previous: Array<CourseData>
}

export async function getUserCourses(req: Request, res: Response): Promise<void> {
  try {
    const teacherCourses: TeacherCourses = { current: [], previous: [] };

    // TODO: Go through course_role instead
    let courses: Array<Course> = await models.Course.findAll({
      attributes: ['id', 'courseCode', 'minCredits', 'maxCredits'],
      include: [{
        model: CourseInstance,
        attributes: ['endDate'],
        where: {
          responsibleTeacher: Number(req.params.userId)
        },
      },
      {
        model: CourseTranslation,
        attributes: ['language', 'courseName', 'department'],
      }],
    });

    // Construct CourseData objects and determine whether the course is current
    // or previous.
    const currentDate: Date = new Date(Date.now());
    for (const i in courses) {
      const course: Course = courses[i];

      // Without these ts-ignores the program fails to build but works otherwise.
      // TODO: How to do this without ts-ignore?

      // @ts-ignore
      const instances: Array<CourseInstance> = course.CourseInstances;

      // @ts-ignore
      const translations: Array<CourseTranslations> = course.CourseTranslations;

      const courseData: CourseData = {
        id: course.id,
        courseCode: course.courseCode,
        minCredits: course.minCredits,
        maxCredits: course.maxCredits,
        department: {
          fi: translations[Language.Finnish].department,
          sv: translations[Language.Swedish].department,
          en: translations[Language.English].department
        },
        name: {
          fi: translations[Language.Finnish].courseName,
          sv: translations[Language.Swedish].courseName,
          en: translations[Language.English].courseName
        },
        evaluationInformation: {
          fi: '',
          sv: '',
          en: ''
        }
      };

      if (currentDate <= new Date(String(instances[instances.length - 1].endDate))) {
        teacherCourses.current.push(courseData);
      } else {
        teacherCourses.previous.push(courseData);
      }
    }

    res.send({
      success: true,
      courses: teacherCourses
    });
  } catch (error) {
    res.status(401);
    res.send({
      success: false,
      error: error
    });
  }
}
