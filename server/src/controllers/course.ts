// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import * as yup from 'yup';

import { sequelize } from '../database';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import TeacherInCharge from '../database/models/teacherInCharge';
import User from '../database/models/user';

import { CourseData } from 'aalto-grades-common/types/course';
import { Language } from 'aalto-grades-common/types/language';
import { idSchema } from '../types/general';
import { HttpCode } from '../types/httpCode';
import { localizedStringSchema } from '../types/language';
import { CourseFull } from '../types/model';
import { findCourseFullById, parseCourseFull } from './utils/course';

export async function getCourse(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const course: CourseFull = await findCourseFullById(
    courseId, HttpCode.NotFound
  );

  res.status(HttpCode.Ok).json({
    success: true,
    data: {
      course: parseCourseFull(course)
    }
  });
}

export async function getAllCourses(req: Request, res: Response): Promise<void> {
  const courses: Array<CourseFull> = await Course.findAll({
    include: [
      {
        model: CourseTranslation
      },
      {
        model: User
      }
    ]
  }) as Array<CourseFull>;

  const coursesData: Array<CourseData> = [];

  for (const course of courses) {
    coursesData.push(parseCourseFull(course));
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
    minCredits: yup.number().min(0).required(),
    maxCredits: yup.number().min(yup.ref('minCredits')).required(),
    teachersInCharge: yup.array().of(
      yup.object().shape({
        id: yup.number().required()
      })
    ).required(),
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
        courseCode: req.body.courseCode,
        minCredits: req.body.minCredits,
        maxCredits: req.body.maxCredits
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

      const teachersInCharge: Array<TeacherInCharge> = req.body.teachersInCharge.map(
        (teacher: { id: number }) => {
          return {
            courseId: course.id,
            userId: teacher.id
          }
        }
      );

      await TeacherInCharge.bulkCreate(teachersInCharge, { transaction: t });

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

