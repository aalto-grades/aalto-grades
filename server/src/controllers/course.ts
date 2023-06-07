// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import * as yup from 'yup';

import { sequelize } from '../database';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';

import { CourseData } from '../types/course';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { Language, localizedStringSchema } from '../types/language';
import { CourseWithTranslation } from '../types/model';
import { findCourseWithTranslationById } from './utils/course';

function parseCourseWithTranslation(course: CourseWithTranslation): CourseData {
  const courseData: CourseData = {
    id: course.id,
    courseCode: course.courseCode,
    department: {
      en: '',
      fi: '',
      sv: ''
    },
    name: {
      en: '',
      fi: '',
      sv: ''
    },
    evaluationInformation: {
      en: '',
      fi: '',
      sv: ''
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

  return courseData;
}

export async function getCourse(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const course: CourseWithTranslation = await findCourseWithTranslationById(
    courseId, HttpCode.NotFound
  );

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      course: parseCourseWithTranslation(course)
    }
  });
}

export async function getAllCourses(req: Request, res: Response): Promise<void> {
  const courses: Array<CourseWithTranslation> = await Course.findAll({
    include: {
      model: CourseTranslation
    }
  }) as Array<CourseWithTranslation>;

  const coursesData: Array<CourseData> = [];

  for (const course of courses) {
    coursesData.push(parseCourseWithTranslation(course));
  }

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      courses: coursesData
    }
  });
}

export async function addCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().required(),
    department: localizedStringSchema.required(),
    name: localizedStringSchema.required()
  });

  /*
   * TODO: Check that the requester is authorized to add a course instance, 403
   * Forbidden if not
   */

  await requestSchema.validate(req.body, { abortEarly: false });

  const course: Course = await sequelize.transaction(
    async (t: Transaction): Promise<Course> => {

      const course: Course = await Course.create({
        courseCode: req.body.courseCode
      }, { transaction: t });

      await CourseTranslation.bulkCreate([
        {
          courseId: course.id,
          language: Language.Finnish,
          department: req.body.department.fi ?? '',
          courseName: req.body.name.fi ?? ''
        },
        {
          courseId: course.id,
          language: Language.English,
          department: req.body.department.en ?? '',
          courseName: req.body.name.en ?? ''
        },
        {
          courseId: course.id,
          language: Language.Swedish,
          department: req.body.department.sv ?? '',
          courseName: req.body.name.sv ?? ''
        }
      ], { transaction: t });

      return course;
    });

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      course: {
        id: course.id
      }
    }
  });
}

