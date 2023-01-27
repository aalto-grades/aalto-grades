// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import models from '../database/models';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import Course from '../database/models/course';
import { CourseData, Language } from './course';

export interface TeacherCourseData {
  current: Array<CourseData>,
  previous: Array<CourseData>
}

export interface CourseWithTranslationAndInstance extends Course {
  CourseTranslations: Array<CourseTranslation>
  CourseInstances: Array<CourseInstance>
}

export async function getUserCourses(req: Request, res: Response): Promise<void> {
  try {
    const teacherCourseData: TeacherCourseData = { current: [], previous: [] };
    const teacherId: number = Number(req.params.userId);

    // TODO: Go through course_role instead
    const courses: Array<CourseWithTranslationAndInstance> = await models.Course.findAll({
      attributes: ['id', 'courseCode', 'minCredits', 'maxCredits'],
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
    }) as Array<CourseWithTranslationAndInstance>;

    // Construct CourseData objects and determine whether the course is current
    // or previous.
    const currentDate: Date = new Date(Date.now());
    for (const i in courses) {
      const course: CourseWithTranslationAndInstance = courses[i];

      const courseData: CourseData = {
        id: course.id,
        courseCode: course.courseCode,
        minCredits: course.minCredits,
        maxCredits: course.maxCredits,
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

      if (currentDate <= new Date(String(course.CourseInstances[course.CourseInstances.length - 1].endDate))) {
        teacherCourseData.current.push(courseData);
      } else {
        teacherCourseData.previous.push(courseData);
      }
    }

    res.send({
      success: true,
      courses: teacherCourseData
    });
  } catch (error) {
    res.status(401);
    res.send({
      success: false,
      error: error
    });
  }
}
