// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import models from '../database/models';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import {
  CourseInstanceData, CourseInstanceRoleType, GradingScale, Period
} from 'aalto-grades-common/types/course';
import { Language } from 'aalto-grades-common/types/language';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';
import { idSchema } from '../types/general';
import { CourseWithTranslation } from '../types/model';
import { findCourseById } from './utils/course';
import { findUserById } from './utils/user';

interface CourseInstanceWithCourseAndTranslation extends CourseInstance {
  Course: CourseWithTranslation,
  Users: Array<User>
}

export async function getCourseInstance(req: Request, res: Response): Promise<void> {
  // Validate IDs.
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const instanceId: number = Number(req.params.instanceId);
  await idSchema.validate({ id: instanceId });

  const instance: CourseInstanceWithCourseAndTranslation | null =
    await models.CourseInstance.findByPk(
      instanceId,
      {
        include: [
          {
            model: Course,
            attributes: ['id', 'courseCode'],
            include: [
              {
                model: CourseTranslation,
                attributes: ['language', 'courseName', 'department']
              }
            ]
          },
          {
            model: User,
            attributes: ['name'],
            where: {
              '$Users->CourseInstanceRole.role$': CourseInstanceRoleType.TeacherInCharge
            }
          }
        ]
      }
    ) as CourseInstanceWithCourseAndTranslation;

  // Verify that a course instance was found.
  if (!instance) {
    throw new ApiError(
      `course instance with ID ${instanceId} not found`, HttpCode.NotFound
    );
  }

  // Verify that the course instance belongs to the found course.
  if (instance.courseId != courseId) {
    throw new ApiError(
      `course instance with ID ${instanceId} ` +
      `does not belong to the course with ID ${courseId}`,
      HttpCode.Conflict
    );
  }

  const parsedInstanceData: CourseInstanceData = {
    id: instance.id,
    sisuCourseInstanceId: instance.sisuCourseInstanceId,
    startingPeriod: instance.startingPeriod as Period,
    endingPeriod: instance.endingPeriod as Period,
    minCredits: instance.minCredits,
    maxCredits: instance.maxCredits,
    startDate: instance.startDate,
    endDate: instance.endDate,
    type: instance.type,
    gradingScale: instance.gradingScale as GradingScale,
    teachersInCharge: [],
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

  for (const teacher of instance.Users) {
    parsedInstanceData.teachersInCharge?.push(teacher.name);
  }

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

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstance: parsedInstanceData
    }
  });
}

export interface CourseInstanceWithTeacherNames extends CourseInstance {
  Users: Array<{ name: string }>
}

export async function getAllCourseInstances(req: Request, res: Response): Promise<void> {
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const course: Course = await findCourseById(courseId, HttpCode.NotFound);

  const instances: Array<CourseInstanceWithTeacherNames> = await CourseInstance.findAll({
    where: {
      courseId: courseId
    },
    include: {
      model: User,
      attributes: ['name'],
      where: {
        '$Users->CourseInstanceRole.role$': CourseInstanceRoleType.TeacherInCharge
      }
    }
  }) as Array<CourseInstanceWithTeacherNames>;

  const instancesData: Array<CourseInstanceData> = [];

  instances.forEach((instanceWithTeacher: CourseInstanceWithTeacherNames) => {
    const instanceData: CourseInstanceData = {
      courseData: {
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
      },
      sisuCourseInstanceId: instanceWithTeacher.sisuCourseInstanceId,
      id: instanceWithTeacher.id,
      startingPeriod: instanceWithTeacher.startingPeriod as Period,
      endingPeriod: instanceWithTeacher.endingPeriod as Period,
      minCredits: instanceWithTeacher.minCredits,
      maxCredits: instanceWithTeacher.maxCredits,
      startDate: instanceWithTeacher.startDate,
      endDate: instanceWithTeacher.endDate,
      type: instanceWithTeacher.type,
      gradingScale: instanceWithTeacher.gradingScale as GradingScale,
      teachersInCharge: [],
    };

    for (const teacher of instanceWithTeacher.Users) {
      instanceData.teachersInCharge?.push(teacher.name);
    }

    instancesData.push(instanceData);
  });

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstances: instancesData
    }
  });
}

interface CourseInstanceAddRequest {
  sisuCourseInstanceId: string | null;
  gradingScale: GradingScale;
  startingPeriod: Period;
  endingPeriod: Period;
  type: string;
  minCredits: number;
  maxCredits: number;
  startDate: Date;
  endDate: Date;
  teachersInCharge: Array<number>;
}

export async function addCourseInstance(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    gradingScale: yup
      .string()
      .oneOf(Object.values(GradingScale))
      .required(),
    sisuCourseInstanceId: yup
      .string()
      .notRequired(),
    startingPeriod: yup
      .string()
      .oneOf(Object.values(Period))
      .required(),
    endingPeriod: yup
      .string()
      .oneOf(Object.values(Period))
      .required(),
    type: yup
      .string()
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
      .required(),
    teachersInCharge: yup
      .array()
      .of(yup.number().moreThan(0))
      .required()
  });

  /*
   * TODO: Check that the requester is authorized to add a course instance, 403
   * Forbidden if not
   */

  const courseId: number = Number(req.params.courseId);

  await requestSchema.validate(req.body, { abortEarly: false });

  const request: CourseInstanceAddRequest = req.body;

  // Confirm that course exists.
  await findCourseById(courseId, HttpCode.NotFound);

  // Confirm that teachers exist.
  for (const teacher of request.teachersInCharge) {
    await findUserById(teacher, HttpCode.UnprocessableEntity);
  }

  const newInstance: CourseInstance = await models.CourseInstance.create({
    courseId: courseId,
    sisuCourseInstanceId: request.sisuCourseInstanceId ?? null,
    gradingScale: request.gradingScale,
    startingPeriod: request.startingPeriod,
    endingPeriod: request.endingPeriod,
    type: request.type,
    minCredits: request.minCredits,
    maxCredits: request.maxCredits,
    startDate: request.startDate,
    endDate: request.endDate
  });

  for (const teacher of request.teachersInCharge) {
    await models.CourseInstanceRole.create({
      userId: teacher,
      courseInstanceId: newInstance.id,
      role: CourseInstanceRoleType.TeacherInCharge
    });
  }

  res.status(HttpCode.Ok).send({
    success: true,
    data: {
      courseInstance: {
        id: newInstance.id
      }
    }
  });
}
