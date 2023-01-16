// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import Course from '../database/models/course';
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

enum Period {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
  V = 'V'
}

interface CourseInstanceAddRequest {
  gradingType: string;
  startingPeriod: Period;
  endingPeriod: Period;
  teachingMethod: string;
  responsibleTeacher: number;
  startDate: string;
  endDate: string;
}

function validatePeriod(period: any): period is Period {
  return typeof period === 'string' && (
    period === 'I' ||
      period === 'II' ||
      period === 'III' ||
      period === 'IV' ||
      period === 'V'
  );
}

function validateCourseInstanceAddFormat(body: any): body is CourseInstanceAddRequest {
  return body &&
    body.gradingType &&
    body.startingPeriod &&
    body.endingPeriod &&
    body.teachingMethod &&
    body.responsibleTeacher &&
    body.startDate &&
    body.endDate &&
    typeof body.gradingType === 'string' &&
    validatePeriod(body.startingPeriod) &&
    validatePeriod(body.endingPeriod) &&
    typeof body.teachingMethod === 'string' &&
    typeof body.responsibleTeacher === 'number' &&
    typeof body.startDate === 'string' &&
    typeof body.endDate === 'string';
}

export async function addCourseInstance(req: Request, res: Response): Promise<void> {
  try {
    const courseId: number = Number(req.params.courseId);

    if (!validateCourseInstanceAddFormat(req.body)) {
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

    models.CourseInstance.create({
      courseId: courseId,
      gradingType: request.gradingType,
      startingPeriod: request.startingPeriod,
      endingPeriod: request.endingPeriod,
      teachingMethod: request.teachingMethod,
      responsibleTeacher: request.responsibleTeacher, // TODO: Is this fine?
      startDate: new Date(request.startDate),
      endDate: new Date(request.endDate),
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    });

    res.send({
      success: true
    });
  } catch (error) {
    res.status(401);
    res.send({
      success: false,
      error: error
    });
  }
}
