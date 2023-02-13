// SPDX-FileCopyrightText: 2022 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { NextFunction, Request, Response } from 'express';
import { Transaction } from 'sequelize';
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
import { sequelize } from '../database';
import { MessageParams } from 'yup/lib/types';

export interface LocalizedString {
  fi: string,
  sv: string,
  en: string
}

export interface CourseData {
  // course id is either number type id in grades db or undefined when representing parsed sisu data
  id?: number,
  courseCode: string,
  department: LocalizedString,
  name: LocalizedString,
  evaluationInformation: LocalizedString
}

export interface InstanceData {
  courseData: CourseData,
  id: number | null,              // Instance id can be null when representing sisu instance data
  sisuCourseInstanceId: string | null,
  startingPeriod: string,
  endingPeriod: string,
  minCredits: number,
  maxCredits: number,
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

interface JsonError extends Error {
  expose?: boolean,
  status?: number,
  statusCode?: number,
  body?: string,
  type?: string
}

const idSchema: yup.AnyObjectSchema = yup.object().shape({
  id: yup
    .number()
    .required()
});

/* Yup validation schema for validating localized strings in requests
 * Does not allow leaving the object empty, requires at least one translation
 * Checks that keys match the ones defined in shape, throws error if they don't
 */
export const localizedStringSchema: yup.AnyObjectSchema = yup.object().shape({
  fi: yup.string(),
  en: yup.string(),
  sv: yup.string()
}).test(
  'localized-string-check-not-empty',
  (params: MessageParams) => `${params.path} must contain at least one translation`,
  (obj: object) => (obj === undefined || obj === null) ? true : Object.keys(obj).length !== 0
).strict().noUnknown().default(undefined);

function parseSisuInstance(instance: SisuInstance): InstanceData {
  return {
    id: null,
    sisuCourseInstanceId: instance.id,
    startingPeriod: '-',
    endingPeriod: '-',
    minCredits: instance.credits.min,
    maxCredits: instance.credits.max,
    startDate: instance.startDate,
    endDate: instance.endDate,
    // TODO use enums here
    courseType: instance.type === 'exam-exam' ? 'EXAM' : 'LECTURE',
    gradingType: instance.summary.gradingScale.fi === '0-5' ? 'NUMERICAL' : 'PASSFAIL',
    responsibleTeachers: instance.summary.teacherInCharge,
    courseData: {
      courseCode: instance.code,
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

// Middleware function for handling errors in JSON parsing
export function handleInvalidRequestJson(err: JsonError, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof SyntaxError && err.status === 400 && err.body !== undefined) {
    res.status(400).send({
      success: false,
      errors: [ `SyntaxError: ${err.message}: ${err.body}` ]
    });
  } else
    next();
}

export async function addCourse(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    courseCode: yup.string().required(),
    department: localizedStringSchema.required(),
    name: localizedStringSchema.required()
  });

  const t: Transaction = await sequelize.transaction();

  try {
    await requestSchema.validate(req.body, { abortEarly: false });

    const course: Course = await Course.create({
      courseCode: req.body.courseCode
    }, { transaction: t });

    const courseTranslations: Array<CourseTranslation> = await CourseTranslation.bulkCreate([
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

    await t.commit();

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

    for (const translation of courseTranslations) {
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
    }

    res.json({ 
      success: true,
      course: courseData
    });
  } catch (error) {
    // TODO: appropriate logging in case of errors
    await t.rollback();

    if (error instanceof yup.ValidationError) {
      res.status(400).json({ 
        success: false,
        errors: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        errors: [ 'Internal Server Error' ]
      });
    }
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
  sisuCourseInstanceId: string | null;
  gradingType: GradingType;
  startingPeriod: Period;
  endingPeriod: Period;
  teachingMethod: TeachingMethod;
  responsibleTeacher: number;
  minCredits: number;
  maxCredits: number;
  startDate: Date;
  endDate: Date;
}

const courseInstanceAddRequestSchema: yup.AnyObjectSchema = yup.object().shape({
  gradingType: yup
    .string()
    .oneOf([GradingType.PassFail, GradingType.Numerical])
    .required(),
  sisuCourseInstanceId: yup
    .string()
    .notRequired(),
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
  minCredits: yup
    .number()
    .min(0)
    .required(),
  maxCredits: yup
    .number()
    .min(yup.ref('minCredits'))
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
      sisuCourseInstanceId: request.sisuCourseInstanceId ?? null,
      gradingType: request.gradingType,
      startingPeriod: request.startingPeriod,
      endingPeriod: request.endingPeriod,
      teachingMethod: request.teachingMethod,
      responsibleTeacher: request.responsibleTeacher,
      minCredits: request.minCredits,
      maxCredits: request.maxCredits,
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
      sisuCourseInstanceId: instance.sisuCourseInstanceId,
      startingPeriod: instance.startingPeriod,
      endingPeriod: instance.endingPeriod,
      minCredits: instance.minCredits,
      maxCredits: instance.maxCredits,
      startDate: instance.startDate,
      endDate: instance.endDate,
      courseType: instance.teachingMethod,
      gradingType: instance.gradingType,
      responsibleTeacher: responsibleTeacher?.name ?? '-',
      courseData: {
        id: instance.Course.id,
        courseCode: instance.Course.courseCode,
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
    const courseCode: string = String(req.params.courseCode);
    const courseInstancesFromSisu: AxiosResponse = await axios.get(`${SISU_API_URL}/courseunitrealisations`, {
      timeout: axiosTimeout,
      params: {
        code: courseCode,
        USER_KEY: SISU_API_KEY
      }
    });

    if (courseInstancesFromSisu.data?.error) throw new Error(courseInstancesFromSisu.data.error.message);
    const parsedInstances: Array<InstanceData> = courseInstancesFromSisu.data.map((instance: SisuInstance) => parseSisuInstance(instance));

    return res.status(200).send({
      success: true,
      data: {
        courseInstances: parsedInstances
      }
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
    // instance id here is sisu id (e.g., 'aalto-CUR-163498-3084205') not course code 
    const sisuCourseInstanceId: string = String(req.params.sisuCourseInstanceId);
    const courseInstanceFromSisu: AxiosResponse = await axios.get(`${SISU_API_URL}/courseunitrealisations/${sisuCourseInstanceId}`, {
      timeout: axiosTimeout,
      params: {
        USER_KEY: SISU_API_KEY
      }
    });

    if (courseInstanceFromSisu.data?.error) throw new Error(courseInstanceFromSisu.data.error.message);
    const instance: InstanceData = parseSisuInstance(courseInstanceFromSisu.data);

    return res.status(200).send({
      success: true,
      data: {
        courseInstance: instance
      }
    });

  } catch (error: unknown) {
    console.log(error);

    return res.status(500).send({
      success: false,
      error: 'Internal Server Error'
    });
  }
}
