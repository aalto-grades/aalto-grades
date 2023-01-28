// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';
import CourseInstance from '../database/models/courseInstance';
import Course from '../database/models/course';
import models from '../database/models';
import { userService, courseService, instanceService } from '../services';
import CourseTranslation from '../database/models/courseTranslation';
import { SISU_API_KEY, SISU_API_URL } from '../configs/environment';
import { axiosTimeout } from '../configs/config';
import axios, { AxiosResponse } from 'axios';
import { SisuInstance } from '../types/sisu';
import User from '../database/models/user';

export interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}

export interface CourseData {
  // course id is either number type id in grades db or undefined when representing parsed sisu data
  id?: number | undefined,
  courseCode: string,
  minCredits: number,
  maxCredits: number,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export interface InstanceData {
  courseData: CourseData,
  // instance id is either Sisu instance id (string) or number type id in grades db
  id: number | string,
  startingPeriod: string,
  endingPeriod: string
  startDate: Date,
  endDate: Date,
  courseType: string,
  gradingType: string,
  responsibleTeacher?: string | undefined,
  responsibleTeachers?: Array<string>,
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

function parseSisuInstance(instance: SisuInstance): InstanceData {
  return {
    // instance id is either Sisu instance id (string) or number type id in grades db
    id: instance.id,
    startingPeriod: '-',
    endingPeriod: '-',
    startDate: instance.startDate,
    endDate: instance.endDate,
    // TODO use enums here
    courseType: instance.type === 'exam-exam' ? 'EXAM' : 'LECTURE',
    gradingType: instance.summary.gradingScale.fi === '0-5' ? 'NUMERICAL' : 'PASSFAIL',
    responsibleTeachers: instance.summary.teacherInCharge,
    courseData: {
      courseCode: instance.code,
      minCredits: instance.credits.min,
      maxCredits: instance.credits.max,
      department: {
        en: instance.organizationName.en,
        fi: instance.organizationName.fi,
        sv: instance.organizationName.sv
      },
      name: {
        en: instance.name.en,
        fi: instance.name.fi,
        sv: instance.name.sv
      },
      evaluationInformation: {
        en: instance.summary.assesmentMethods.en,
        fi: instance.summary.assesmentMethods.fi,
        sv: instance.summary.assesmentMethods.sv
      }
    }
  };
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

const courseInstanceAddRequestSchema: yup.AnyObjectSchema = yup.object().shape({
  gradingType: yup
    .string()
    .oneOf([GradingType.PassFail, GradingType.Numerical])
    .required(),
  startingPeriod: yup
    .string()
    .oneOf([Period.I, Period.II, Period.III, Period.IV, Period.V])
    .required(),
  endingPeriod: yup
    .string()
    .oneOf([Period.I, Period.II, Period.III, Period.IV, Period.V])
    .required(),
  teachingMethod: yup
    .string()
    .oneOf([TeachingMethod.Lecture, TeachingMethod.Exam])
    .required(),
  responsibleTeacher: yup
    .number()
    .required(),
  startDate: yup
    .date()
    .required(),
  endDate: yup
    .date()
    .required()
});

export async function addCourseInstance(req: Request, res: Response): Promise<Response> {
  try {
    const courseId: number = Number(req.params.courseId);

    await courseInstanceAddRequestSchema.validate(req.body, { abortEarly: false });

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

    if (teacher == null) {
      throw new Error(`User with ID ${request.responsibleTeacher} does not exist`);
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
      instance: {
        id: newInstance.id
      }
    });
  } catch (error) {

    if (error instanceof yup.ValidationError) {
      res.status(400);
      return res.send({
        success: false,
        error: error.errors
      });
    }

    res.status(401);
    return res.send({
      success: false,
      error: error
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

export async function fetchAllInstancesFromSisu(req: Request, res: Response): Promise<Response> {
  try {
    const courseId: string = String(req.params.courseId);
    const instancesFromSisu: AxiosResponse = await axios.get(`${SISU_API_URL}/courseunitrealisations`, {
      timeout: axiosTimeout,
      params: {
        code: courseId,
        USER_KEY: SISU_API_KEY
      }
    });

    if (instancesFromSisu.data?.error) throw new Error(instancesFromSisu.data.error.message);
    const parsedInstances: Array<InstanceData> = instancesFromSisu.data.map((instance: SisuInstance) => parseSisuInstance(instance));

    return res.status(200).send({
      success: true,
      instances: parsedInstances
    });
  } catch (error: unknown) {
    console.log(error);

    return res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

export async function fetchInstanceFromSisu(req: Request, res: Response): Promise<Response> {
  try {
    // instance id here is sisu id not course code, for example 'aalto-CUR-163498-3084205'
    const instanceId: string = String(req.params.instanceId);
    const instanceFromSisu: AxiosResponse = await axios.get(`${SISU_API_URL}/courseunitrealisations/${instanceId}`, {
      timeout: axiosTimeout,
      params: {
        USER_KEY: SISU_API_KEY
      }
    });

    if (instanceFromSisu.data?.error) throw new Error(instanceFromSisu.data.error.message);
    const instance: InstanceData = parseSisuInstance(instanceFromSisu.data);

    return res.status(200).send({
      success: true,
      instance: instance
    });

  } catch (error: unknown) {
    console.log(error);

    return res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}
