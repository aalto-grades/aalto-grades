// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';
import { userService, courseService } from '../services';

export interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}

export interface Course {
  id: number,
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export interface Instance extends Course {
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
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const course: any = await courseService.findCourseById(courseId, null);
  
    const courseData: Course = {
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
  
    res.status(200);
    return res.send({
      success: true,
      course: courseData
    });
  } catch (error: unknown) {
    console.log(error);
  
    if (error instanceof Error) {
      res.status(404);
      return res.send({
        success: false,
        error: error.message
      });
    }
    res.status(500);
    return res.send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}
      
export async function getInstance(req: Request, res: Response): Promise<Response> {
  try {
    const courseId: number = Number(req.params.courseId);
    const instanceId: number = Number(req.params.instanceId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const course: any = await courseService.findCourseById(courseId, instanceId);

    const responsibleTeacher: User = await userService.findUserById(course.CourseInstances[0].responsibleTeacher);
    
    const instanceData: Instance = {
      id: course.id,
      courseCode: course.courseCode,
      minCredits: course.minCredits,
      maxCredits: course.maxCredits,
      startingPeriod: course.CourseInstances[0].startingPeriod,
      endingPeriod: course.CourseInstances[0].endingPeriod,
      startDate: course.CourseInstances[0].startDate,
      endDate: course.CourseInstances[0].endDate,
      courseType: course.CourseInstances[0].teachingMethod,
      gradingType: course.CourseInstances[0].gradingType,
      responsibleTeacher: responsibleTeacher?.name ?? '-',
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
        instanceData.department.en = translation.department;
        instanceData.name.en = translation.courseName;
        break;
      case Language.Finnish:
        instanceData.department.fi = translation.department;
        instanceData.name.fi = translation.courseName;
        break;
      case Language.Swedish:
        instanceData.department.sv = translation.department;
        instanceData.name.sv = translation.courseName;
        break;
      }
    });
  
    res.status(200);
    return res.send({
      success: true,
      instance: instanceData
    });
  } catch (error: unknown) {
    console.log(error);
  
    if (error instanceof Error) {
      res.status(404);
      return res.send({
        success: false,
        error: error.message
      });
    }
    res.status(500);
    return res.send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}
