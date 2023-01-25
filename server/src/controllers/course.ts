// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import { courseService } from '../services';
import * as yup from 'yup';
import CourseInstance from '../database/models/courseInstance';

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

export interface InstanceData extends CourseData {
  startingPeriod: string,
  endingPeriod: string,
  startDate: Date,
  endDate: Date,
  courseType: string,
  gradingType: string,
  responsibleTeacher: string | undefined,
}

export enum Language {
  English = 'EN',
  Finnish = 'FI',
  Swedish = 'SV'
}

const idSchema: yup.AnyObjectSchema = yup.object().shape({
  id: yup
    .number()
    .required()
});

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
    
export async function getAllCourseInstances(req: Request, res: Response): Promise<Response> {
  try {
    const courseId: number = Number(req.params.courseId)
    await idSchema.validate({ id: courseId });
    const instances: Array<CourseInstance> = await courseService.findAllInstances(courseId);

    return res.status(200).send({
      success: true,
      instances: instances,
    });

  } catch (error: unknown) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).send({
        success: false,
        error: error.errors
      });
    }
    
    if (error instanceof Error && error?.message.startsWith('course with id')) {
      return res.status(404).send({
        success: false,
        error: error.message
      });
    }

    return res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}
