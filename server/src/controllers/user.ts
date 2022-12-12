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
    let instances: Array<CourseInstance> = await models.CourseInstance.findAll({
      where: {
        responsibleTeacher: Number(req.params.userId)
      }
    });

    // Sort all courses according to end date from highest to lowest.
    instances = instances.sort((a: CourseInstance, b: CourseInstance): number => {
      if (a.endDate < b.endDate)
        return 1;
      if (a.endDate > b.endDate)
        return -1;

      return 0;
    });

    // Filter out all course instances with duplicate course IDs, leaving only
    // the latest instance of each course, which can be used to determine
    // whether the teacher is currently teaching the course or did so in the
    // past.
    const courseFlags: Set<number> = new Set();
    instances = instances.filter((courseInstance: CourseInstance) => {
      if (courseFlags.has(courseInstance.courseId)) {
        return false;
      }
      courseFlags.add(courseInstance.courseId);
      return true;
    });

    // Construct CourseData objects and determine whether the course is current
    // or previous.
    const currentDate: Date = new Date(Date.now());
    for (const i in instances) {
      const courseInstance: CourseInstance = instances[i];
      const course: Course = await models.Course.findByPk(courseInstance.courseId) as Course;

      if (course == null) {
        console.log(`ERROR: Course instance with ID ${courseInstance.id} references
                     non-existent course with ID ${courseInstance.courseId}`);
        continue;
      }

      const translations: Array<CourseTranslation> = await models.CourseTranslation.findAll({
        where: {
          courseId: course.id
        }
      });

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

      if (currentDate <= new Date(String(courseInstance.endDate))) {
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
