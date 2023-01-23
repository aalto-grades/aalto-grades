// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';
import { userService, courseService, instanceService } from '../services';

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

export interface InstanceData {
  courseData: CourseData,
  id: number,
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

export async function getCourse(req: Request, res: Response): Promise<Response> {
  try {
    const courseId: number = Number(req.params.courseId);
    await idSchema.validate({ id: courseId });
    const course: courseService.CourseWithTranslation = await courseService.findCourseById(courseId);
  
    const courseData: CourseData = {
      id: course.id,
      courseCode: course.courseCode,
      minCredits: course.minCredits,
      maxCredits: course.maxCredits,
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
  
    return res.status(200).send({
      success: true,
      course: courseData
    });
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof yup.ValidationError) {
      return res.status(400).send({
        success: false,
        error: error.errors
      });
    }

    if (error instanceof Error && error?.message.startsWith('course with an id')) {
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
      
export async function getInstance(req: Request, res: Response): Promise<Response> {
  try {
    const instanceId: number = Number(req.params.instanceId);
    await idSchema.validate({ id: instanceId });

    const instance: instanceService.InstanceWithCourseAndTranslation = await instanceService.findInstanceById(instanceId);
    const responsibleTeacher: User = await userService.findUserById(instance.responsibleTeacher);
    
    const parsedInstanceData: InstanceData = {
      id: instance.id,
      startingPeriod: instance.startingPeriod,
      endingPeriod: instance.endingPeriod,
      startDate: instance.startDate,
      endDate: instance.endDate,
      courseType: instance.teachingMethod,
      gradingType: instance.gradingType,
      responsibleTeacher: responsibleTeacher?.name ?? '-',
      courseData: {
        id: instance.Course.id,
        courseCode: instance.Course.courseCode,
        minCredits: instance.Course.minCredits,
        maxCredits: instance.Course.maxCredits,
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
      }
    };

    instance.Course.CourseTranslations.forEach((translation: CourseTranslation) => {
      switch (translation.language) {
      case Language.English:
        parsedInstanceData.courseData.department.en = translation.department;
        parsedInstanceData.courseData.name.en = translation.courseName;
        break;
      case Language.Finnish:
        parsedInstanceData.courseData.department.fi = translation.department;
        parsedInstanceData.courseData.name.fi = translation.courseName;
        break;
      case Language.Swedish:
        parsedInstanceData.courseData.department.sv = translation.department;
        parsedInstanceData.courseData.name.sv = translation.courseName;
        break;
      }
    });

    return res.status(200).send({
      success: true,
      instance: parsedInstanceData
    });
  } catch (error: unknown) {
    console.log(error);

    if (error instanceof yup.ValidationError) {
      return res.status(400).send({
        success: false,
        error: error.errors
      });
    }

    if (error instanceof Error && error?.message.startsWith('course instance with an id')) {
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
