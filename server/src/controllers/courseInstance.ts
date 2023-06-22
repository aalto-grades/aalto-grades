// SPDX-FileCopyrightText: 2023 The Aalto Grades Developers
//
// SPDX-License-Identifier: MIT

import { Request, Response } from 'express';
import * as yup from 'yup';

import AssessmentModel from '../database/models/assessmentModel';
import Course from '../database/models/course';
import CourseInstance from '../database/models/courseInstance';
import CourseInstanceRole from '../database/models/courseInstanceRole';
import CourseTranslation from '../database/models/courseTranslation';
import User from '../database/models/user';

import {
  CourseInstanceData, CourseInstanceRoleType, GradingScale, Period
} from 'aalto-grades-common/types/course';
import { ApiError } from '../types/error';
import { HttpCode } from '../types/httpCode';
import { idSchema } from '../types/general';
import { CourseWithTranslation } from '../types/model';
import { findAssessmentModelById } from './utils/assessmentModel';
import { findCourseById, parseCourseWithTranslation } from './utils/course';
import { findUserById } from './utils/user';

export async function getCourseInstance(req: Request, res: Response): Promise<void> {
  // Validate IDs.
  const courseId: number = Number(req.params.courseId);
  await idSchema.validate({ id: courseId });

  const instanceId: number = Number(req.params.instanceId);
  await idSchema.validate({ id: instanceId });

  interface CourseInstanceWithCourseAndTranslation extends CourseInstance {
    Course: CourseWithTranslation,
    Users: Array<User>
  }

  const instance: CourseInstanceWithCourseAndTranslation | null =
    await CourseInstance.findByPk(
      instanceId,
      {
        include: [
          {
            model: Course,
            include: [
              {
                model: CourseTranslation
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
    assessmentModelId: instance.assessmentModelId,
    sisuCourseInstanceId: instance.sisuCourseInstanceId,
    startingPeriod: instance.startingPeriod as Period,
    endingPeriod: instance.endingPeriod as Period,
    startDate: instance.startDate,
    endDate: instance.endDate,
    type: instance.type,
    gradingScale: instance.gradingScale as GradingScale,
    teachersInCharge: [],
    courseData: parseCourseWithTranslation(instance.Course)
  };

  for (const teacher of instance.Users) {
    (parsedInstanceData.teachersInCharge as Array<string>).push(teacher.name);
  }

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
      },
      assessmentModelId: instanceWithTeacher.assessmentModelId,
      sisuCourseInstanceId: instanceWithTeacher.sisuCourseInstanceId,
      id: instanceWithTeacher.id,
      startingPeriod: instanceWithTeacher.startingPeriod as Period,
      endingPeriod: instanceWithTeacher.endingPeriod as Period,
      startDate: instanceWithTeacher.startDate,
      endDate: instanceWithTeacher.endDate,
      type: instanceWithTeacher.type,
      gradingScale: instanceWithTeacher.gradingScale as GradingScale,
      teachersInCharge: [],
    };

    for (const teacher of instanceWithTeacher.Users) {
      (instanceData.teachersInCharge as Array<string>).push(teacher.name);
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

export async function addCourseInstance(req: Request, res: Response): Promise<void> {
  const requestSchema: yup.AnyObjectSchema = yup.object().shape({
    assessmentModelId: yup
      .number()
      .notRequired(),
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

  // Confirm that course exists.
  await findCourseById(courseId, HttpCode.NotFound);

  // Confirm that teachers exist.
  for (const teacher of req.body.teachersInCharge) {
    await findUserById(teacher, HttpCode.UnprocessableEntity);
  }

  if (req.body.assessmentModelId) {
    const assessmentModel: AssessmentModel = await findAssessmentModelById(
      req.body.assessmentModelId, HttpCode.UnprocessableEntity
    );

    if (assessmentModel.courseId !== courseId) {
      throw new ApiError(
        `assessment model with ID ${assessmentModel.id} ` +
        `does not belong to the course with ID ${courseId}`,
        HttpCode.Conflict
      );
    }
  }

  const newInstance: CourseInstance = await CourseInstance.create({
    courseId: courseId,
    assessmentModelId: req.body.assessmentModelId,
    sisuCourseInstanceId: req.body.sisuCourseInstanceId,
    gradingScale: req.body.gradingScale,
    startingPeriod: req.body.startingPeriod,
    endingPeriod: req.body.endingPeriod,
    type: req.body.type,
    startDate: req.body.startDate,
    endDate: req.body.endDate
  });

  for (const teacher of req.body.teachersInCharge) {
    await CourseInstanceRole.create({
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
