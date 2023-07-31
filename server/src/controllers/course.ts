// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { CourseData, HttpCode, Language, UserData } from 'aalto-grades-common/types';
import { Request, Response } from 'express';
import { Transaction } from 'sequelize';
import * as yup from 'yup';

import { sequelize } from '../database';
import Course from '../database/models/course';
import CourseTranslation from '../database/models/courseTranslation';
import TeacherInCharge from '../database/models/teacherInCharge';
import User from '../database/models/user';

import { ApiError, CourseFull, idSchema, localizedStringSchema } from '../types';
import { findCourseById, findCourseFullById, parseCourseFull } from './utils/course';

export async function getCourse(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const course: CourseFull = await findCourseFullById(
    courseId, HttpCode.NotFound
  );

  res.status(HttpCode.Ok).json({
    data: parseCourseFull(course)
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
    data: coursesData
  });
}

export async function addCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().required(),
    minCredits: yup.number().min(0).required(),
    maxCredits: yup.number().min(yup.ref('minCredits')).required(),
    teachersInCharge: yup.array().of(
      yup.object().shape({
        email: yup.string().email().required()
      })
    ).required(),
    department: localizedStringSchema.required(),
    name: localizedStringSchema.required()
  });

  await requestSchema.validate(req.body, { abortEarly: false });

  const emailList: Array<string> = req.body.teachersInCharge.map(
    (teacher: UserData) => teacher.email
  );

  const teachers: Array<User> = await User.findAll({
    attributes: ['id', 'email'],
    where: {
      email: emailList
    }
  });

  // Check for non existent emails.
  if (emailList.length !== teachers.length) {
    const missingEmails: Array<string> =
      emailList.filter(
        (teacher: string) => teachers.map((user: User) => user.email).indexOf(teacher) === -1
      );

    throw new ApiError(
      missingEmails.map((email: string) => `No user with email address ${email} found`),
      HttpCode.NotFound
    );
  }

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

      const teachersInCharge: Array<TeacherInCharge> = teachers.map(
        (teacher: User) => {
          return {
            courseId: course.id,
            userId: teacher.id
          };
        }
      ) as Array<TeacherInCharge>;

      await TeacherInCharge.bulkCreate(teachersInCharge, { transaction: t });

      return course;
    });

  res.status(HttpCode.Ok).json({
    data: course.id
  });
}

export async function editCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().notRequired(),
    minCredits: yup.number().min(0).notRequired(),
    maxCredits: yup.number().min(yup.ref('minCredits')).notRequired(),
    teachersInCharge: yup.array().of(
      yup.object().shape({
        email: yup.string().email().required()
      })
    ).notRequired(),
    department: localizedStringSchema.notRequired(),
    name: localizedStringSchema.notRequired()
  });

  await requestSchema.validate(req.body, { abortEarly: false });
  const courseId: number = (await idSchema.validate({ id: req.params.courseId })).id;

  const course: Course = await findCourseById(courseId, HttpCode.NotFound);

  res.status(HttpCode.Ok);
}
