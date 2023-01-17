// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';
import CourseInstance from '../database/models/courseInstance';
import Course from '../database/models/course';
import User from '../database/models/user';
import models from '../database/models';

export interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}

export interface CourseData {
  id: number,
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export enum Language {
  English = 'EN',
  Finnish = 'FI',
  Swedish = 'SV'
}

export async function addCourse(req: Request, res: Response): Promise<void> {
  try {
    // TODO: add the course to the database
    res.send({
      success: true
    });
  } catch (error) {
    res.status(401);
    res.send({
      success: false,
      error: error,
    });
  }
}

enum GradingType {
  PassFail = 'PASSFAIL',
  Numerical = 'NUMERICAL'
}

enum Period {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V'
}

enum TeachingMethod {
  Lecture = 'LECTURE',
  Exam = 'EXAM'
}

interface CourseInstanceAddRequest {
  gradingType: GradingType;
  startingPeriod: Period;
  endingPeriod: Period;
  teachingMethod: TeachingMethod;
  responsibleTeacher: number;
  startDate: Date;
  endDate: Date;
}

const courseInstanceAddRequestSchema: yup.AnyObjectSchema = yup.object({
  gradingType: yup.string().oneOf([GradingType.PassFail, GradingType.Numerical]).required(),
  startingPeriod: yup.string().oneOf([Period.I, Period.II, Period.III, Period.IV, Period.V]).required(),
  endingPeriod: yup.string().oneOf([Period.I, Period.II, Period.III, Period.IV, Period.V]).required(),
  teachingMethod: yup.string().oneOf([TeachingMethod.Lecture, TeachingMethod.Exam]).required(),
  responsibleTeacher: yup.number().required(),
  startDate: yup.date().required(),
  endDate: yup.date().required()
});

export async function addCourseInstance(req: Request, res: Response): Promise<Response> {
  try {
    const courseId: number = Number(req.params.courseId);

    if (!await courseInstanceAddRequestSchema.validate(req.body)) {
      throw new Error('Invalid course instance addition format');
    }

    const request: CourseInstanceAddRequest = req.body;

    const course: Course | null = await models.Course.findOne({
      where: {
        id: courseId
      },
    });

    if (course == null) {
      throw new Error(`Course with ID ${courseId} does not exist`);
    }

    const teacher: User | null = await models.User.findOne({
      where: {
        id: request.responsibleTeacher
      },
    });

    // TODO: Also check that user has correct role
    if (teacher == null) {
      throw new Error(`Teacher with ID ${request.responsibleTeacher} does not exist`);
    }

    const newInstance: CourseInstance = await models.CourseInstance.create({
      courseId: courseId,
      gradingType: request.gradingType,
      startingPeriod: request.startingPeriod,
      endingPeriod: request.endingPeriod,
      teachingMethod: request.teachingMethod,
      responsibleTeacher: request.responsibleTeacher,
      startDate: request.startDate,
      endDate: request.endDate
    });

    return res.send({
      success: true,
      instance: newInstance
    });
  } catch (error) {
    res.status(401);
    return res.send({
      success: false,
      error: error
    });
  }
}
